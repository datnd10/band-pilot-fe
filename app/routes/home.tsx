import { Link } from 'react-router'

export function meta() {
  return [
    { title: 'Band Pilot – IELTS Vocabulary Learning' },
    { name: 'description', content: 'Master IELTS vocabulary with flashcards and typing tests' },
  ]
}

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-20">

      {/* ── Hero ── */}
      <section className="text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          ✈️ IELTS Vocabulary Tool
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Band Pilot
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500 leading-relaxed">
          Build, organize, and master your IELTS vocabulary — create study sets,
          learn with flashcards, and test yourself with typing drills.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Browse dictionary
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section>
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">How it works</h2>
        <p className="mb-8 text-center text-2xl font-bold text-gray-900">Three steps to better vocabulary</p>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Create a Study Set',
              desc: 'Organise words by topic or source — e.g. "Cambridge 13 Test 1" or "Academic Word List".',
              color: 'blue',
            },
            {
              step: '02',
              title: 'Add Your Words',
              desc: 'Type words one by one or paste a bulk list using the pipe-delimited format. Fast and flexible.',
              color: 'indigo',
            },
            {
              step: '03',
              title: 'Study & Test',
              desc: 'Review with flipcards or test your active recall with typing drills — all within that set.',
              color: 'green',
            },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className={`mb-4 inline-block rounded-lg bg-${color}-100 px-2.5 py-1 text-sm font-bold text-${color}-700`}>{step}</span>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">Features</h2>
        <p className="mb-8 text-center text-2xl font-bold text-gray-900">Everything you need to learn vocabulary</p>
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Flashcards */}
          <Link to="/groups" className="group flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-6 transition-colors hover:bg-blue-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Flashcards</h3>
              <p className="mt-1 text-sm text-blue-700 leading-relaxed">Flip through cards with Space, navigate with arrow keys, hear pronunciation with P. Shuffle for variety.</p>
            </div>
          </Link>

          {/* Typing Test */}
          <Link to="/groups" className="group flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 transition-colors hover:bg-indigo-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">Typing Test</h3>
              <p className="mt-1 text-sm text-indigo-700 leading-relaxed">See the Vietnamese meaning, type the English word. Case-insensitive, instant feedback, shuffle supported.</p>
            </div>
          </Link>

          {/* Dictionary */}
          <Link to="/vocabulary" className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Dictionary</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">Search and filter all your words by type, status, or keyword. View detailed entries with phonetics and examples.</p>
            </div>
          </Link>

          {/* Bulk Import */}
          <Link to="/groups" className="group flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-6 transition-colors hover:bg-amber-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Bulk Import</h3>
              <p className="mt-1 text-sm text-amber-700 leading-relaxed">Paste up to 500 words at once using the pipe format: <span className="font-mono text-xs">word|meaning|phonetic|type</span>. Duplicates are skipped automatically.</p>
            </div>
          </Link>

        </div>
      </section>

      {/* ── Keyboard shortcuts callout ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Built for keyboard learners</h2>
        <p className="mb-6 text-sm text-gray-500">No mouse needed while studying — every action has a keyboard shortcut.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: 'Space', action: 'Flip flashcard' },
            { key: '← →', action: 'Previous / Next card' },
            { key: 'P', action: 'Pronounce current word' },
            { key: 'Enter', action: 'Submit answer (typing test)' },
          ].map(({ key, action }) => (
            <div key={key} className="flex items-center gap-3">
              <kbd className="rounded-lg border border-gray-300 bg-gray-100 px-2.5 py-1 font-mono text-sm font-medium text-gray-700 shadow-sm">{key}</kbd>
              <span className="text-sm text-gray-600">{action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-12 text-center text-white shadow-lg">
        <h2 className="text-3xl font-extrabold">Ready to aim for Band 7+?</h2>
        <p className="mt-3 text-blue-200">Create your first study set and start building your vocabulary today.</p>
        <Link
          to="/groups"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
        >
          Create a study set
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Link>
      </section>

    </div>
  )
}
