import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Profile</h1>
      <div className="card space-y-2 text-sm">
        <p><span className="text-gray-500">Name:</span> {user?.fullName}</p>
        <p><span className="text-gray-500">Email:</span> {user?.email}</p>
      </div>
    </div>
  );
}
