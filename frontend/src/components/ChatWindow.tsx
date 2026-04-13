import { useEffect, useRef, useState } from 'react'; // ← добавлен useState
import { Users, Wifi, WifiOff } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import UserList from './UserList'; // ← добавлен импорт
import type { Message } from '../hooks/useWebSocket';

interface ChatWindowProps {
  username: string;
  messages: Message[];
  users: string[];
  typingUsers: string[];
  isConnected: boolean;
  onSendMessage: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export default function ChatWindow({
  username,
  messages,
  users,
  typingUsers,
  isConnected,
  onSendMessage,
  onTyping,
  onStopTyping,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showUsers, setShowUsers] = useState(false); // ← теперь useState определён

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Chat Room</h2>
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors lg:hidden"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.username === username}
            />
          ))}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic mt-2">
              {typingUsers.filter((u) => u !== username).join(', ')}
              {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          disabled={!isConnected}
        />
      </div>

      {/* User list sidebar */}
      <div
        className={`
        ${showUsers ? 'block' : 'hidden'} 
        lg:block w-64 bg-gray-100 border-l border-gray-200 p-4
      `}
      >
        <UserList users={users} currentUser={username} />
      </div>
    </div>
  );
}