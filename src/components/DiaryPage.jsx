import { films } from '../catalog.js'

// Every film logged as watched, newest first, grouped by month. Films marked
// as seen before the diary are left out.
export default function DiaryPage({ diary, onOpen }) {
  const entries = Object.entries(diary)
    .filter(([id, entry]) => !entry.seen && films.has(id))
    .map(([id, entry]) => ({ film: films.get(id), ...entry }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.film.title.localeCompare(b.film.title))

  if (entries.length === 0) {
    return <p className="muted diary-empty">Nothing logged yet. Films you log with “Log a screening” show up here.</p>
  }

  const months = []
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    if (months.at(-1)?.key !== key) months.push({ key, entries: [] })
    months.at(-1).entries.push(e)
  }

  return (
    <div className="diary">
      {months.map((m) => (
        <section key={m.key} className="diary-month">
          <h2 className="diary-month-title">
            {monthLabel(m.key)} <span>/ {m.entries.length}</span>
          </h2>
          <ol className="diary-entries">
            {m.entries.map((e) => (
              <li key={e.film.id}>
                <button className="diary-entry" onClick={() => onOpen(e.film.id)}>
                  <span className="diary-day">{Number(e.date.slice(8))}</span>
                  <span className="diary-body">
                    <span className="diary-film">
                      {e.film.title} <span className="muted">({e.film.year})</span>
                    </span>
                    <span className="diary-meta">
                      {e.film.paths.map((p) => (
                        <span key={p.id} className="dot" style={{ background: p.color.hex }} title={p.name} />
                      ))}
                      {e.place && <span>{e.place}</span>}
                    </span>
                    {e.note && <span className="note diary-note">{e.note}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${new Date(y, m - 1).toLocaleDateString('en-GB', { month: 'long' }).toLowerCase()} ${y}`
}
