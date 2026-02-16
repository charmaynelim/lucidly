export default function Header({ onSignOut }) {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold">Lucidly</h1>
      <button
        onClick={onSignOut}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Sign out
      </button>
    </header>
  )
}
