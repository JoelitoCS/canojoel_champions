import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-3xl font-extrabold text-white mb-2">Error d&apos;autenticació</h1>
        <p className="text-zinc-400 mb-8">Hi ha hagut un problema en iniciar sessió. Torna-ho a intentar.</p>
        <Link
          href="/auth/login"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Tornar al login
        </Link>
      </div>
    </div>
  );
}
