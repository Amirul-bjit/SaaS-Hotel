import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">🚫</div>
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Access Denied</h1>
      <p className="mb-6 text-gray-500">
        You don&apos;t have permission to view this page.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}
