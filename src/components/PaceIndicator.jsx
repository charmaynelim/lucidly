const GOAL = 30
const YEAR = 2026

export default function PaceIndicator({ books }) {
  const now = new Date()
  const startOfYear = new Date(YEAR, 0, 1)
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24))
  const expectedPace = (GOAL / 365) * dayOfYear
  const finishedCount = books.filter((b) => b.status === 'finished').length
  const delta = finishedCount - expectedPace
  const daysRemaining = 365 - dayOfYear
  const progress = Math.min(finishedCount / GOAL, 1)

  let message
  if (delta >= 1) {
    message = `You're ${Math.floor(delta)} book${Math.floor(delta) !== 1 ? 's' : ''} ahead of pace.`
  } else if (delta > -1) {
    message = "You're right on pace."
  } else {
    const behind = Math.ceil(Math.abs(delta))
    message = `You're ${behind} book${behind !== 1 ? 's' : ''} behind. That's okay — you have ${daysRemaining} days left.`
  }

  return (
    <div className="rounded-xl bg-stone-50 p-5">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-semibold tabular-nums">{finishedCount}</span>
        <span className="text-sm text-gray-400">of {GOAL} books</span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
