'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="px-6 py-16 max-w-md mx-auto text-center">
      <h2 className="headline text-2xl mb-3">Something went wrong</h2>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-left bg-tan/20 p-3 rounded mb-4 overflow-auto">{error.message}</pre>
      )}
      <button type="button" onClick={reset} className="btn-primary">Try again</button>
    </main>
  );
}
