import { format } from 'date-fns';
import type { Message } from '../hooks/useWebSocket';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.system) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : ''}`}>
        {!isOwn && (
          <div className="text-sm text-gray-600 mb-1">{message.username}</div>
        )}
        <div className={`
          rounded-lg px-4 py-2
          ${isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-800 shadow-sm'
          }
        `}>
          <p>{message.text}</p>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>
    </div>
  );
}