import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-300">404</h1>
      <p className="mt-2 text-gray-600">Page not found.</p>
      <Link to="/" className="btn-primary mt-4">Go home</Link>
    </div>
  );
}
