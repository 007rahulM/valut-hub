// pages/NotFoundPage.tsx
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-8xl mb-6">🤔</div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Page not found</h1>
      <p className="text-slate-500 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Go home
      </a>
    </div>
  );
}