import { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export default function MessageInput({ 
  onSendMessage, 
  onTyping, 
  onStopTyping,
  disabled 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (e.target.value.length > 0) {
      onTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 1 second of no input
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 1000);
    } else {
      onStopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      onStopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          disabled={disabled}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}