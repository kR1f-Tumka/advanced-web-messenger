import { useState } from 'react'; // ← добавлен импорт
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    error,
    connect,
    sendMessage,
    sendTyping,
    sendStopTyping,
  } = useWebSocket('ws://localhost:8080');

  const handleLogin = (name: string) => {
    setUsername(name);
    connect(name);
  };

  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };

  if (!username) {
    return <LoginScreen onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="h-screen">
      <ChatWindow
        username={username}
        messages={messages}
        users={users}
        typingUsers={typingUsers}
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
        onTyping={sendTyping}
        onStopTyping={sendStopTyping}
      />
    </div>
  );
}

export default App;