import type { User } from "../types";

interface UserListProps {
  users: User[];
  currentUsername: string;
}

function UserList({ users, currentUsername }: UserListProps) {
  return (
    <div className="user-list">
      <div className="user-list-header">Online ({users.length})</div>
      <ul className="user-list-items">
        {users.map((user) => (
          <li
            key={user.id}
            className={
              user.username === currentUsername
                ? "user-item user-item-self"
                : "user-item"
            }
          >
            <span className="user-dot" />
            {user.username}
            {user.username === currentUsername && (
              <span className="user-you"> (you)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
