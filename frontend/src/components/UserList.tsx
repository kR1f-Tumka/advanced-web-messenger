import { User } from 'lucide-react';

interface UserListProps {
  users: string[];
  currentUser: string;
}

export default function UserList({ users, currentUser }: UserListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <User className="w-5 h-5 mr-2" />
        Online Users ({users.length})
      </h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user}
            className={`
              flex items-center space-x-2 p-2 rounded-md
              ${user === currentUser ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}
            `}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">
              {user} {user === currentUser && '(you)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}