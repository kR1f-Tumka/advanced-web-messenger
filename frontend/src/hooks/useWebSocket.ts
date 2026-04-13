import { useState, useRef, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  username?: string;
  text: string;
  timestamp: number;
  system?: boolean;
}

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string>('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback((username: string) => {
    usernameRef.current = username;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'auth', payload: { username } }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'user_list':
            setUsers(data.payload);
            setIsConnected(true);
            setError(null);
            break;
          
          case 'message':
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              username: data.payload.username,
              text: data.payload.text,
              timestamp: data.payload.timestamp,
              system: data.payload.system || false,
            }]);
            break;
          
          case 'typing':
            setTypingUsers(prev => {
              if (!prev.includes(data.payload.username)) {
                return [...prev, data.payload.username];
              }
              return prev;
            });
            break;
          
          case 'stop_typing':
            setTypingUsers(prev => prev.filter(u => u !== data.payload.username));
            break;
          
          case 'error':
            setError(data.payload.message);
            setIsConnected(false);
            break;
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setUsers([]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };
  }, [url]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        payload: { text },
      }));
    }
  }, []);

  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', payload: {} }));
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'stop_typing', payload: {} }));
        }
      }, 2000);
    }
  }, []);

  const sendStopTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop_typing', payload: {} }));
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  return {
    isConnected,
    messages,
    users,
    typingUsers,
    error,
    connect,
    sendMessage,
    sendTyping,
    sendStopTyping,
  };
};