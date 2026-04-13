import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  error: string | null;
}

export default function LoginScreen({ onLogin, error }: LoginScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <MessageCircle className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Advanced Web Messenger
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
              pattern="[a-zA-Z0-9_]{3,20}"
              title="3-20 characters, letters, numbers and underscore only"
              required
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
}