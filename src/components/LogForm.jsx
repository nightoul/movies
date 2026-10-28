import { useMemo, useState } from 'react'
import { films, today } from '../catalog.js'
import { ModalHeader } from './Modal.jsx'

const MAX_RESULTS = 8

export default function LogForm({ diary, editing, onSave, onClose }) {
  const existing = editing ? diary[editing.id] : null
  const [query, setQuery] = useState('')
  const [film, setFilm] = useState(editing)
  const [place, setPlace] = useState(existing?.place ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const unwatched = useMemo(
    () => [...films.values()].filter((f) => !diary[f.id]).sort((a, b) => a.title.localeCompare(b.title)),
    [diary],
  )
  const results = query.trim()
    ? unwatched.filter((f) => normalize(f.title).includes(normalize(query))).slice(0, MAX_RESULTS)
    : []
  const places = useMemo(
    () => [...new Set(Object.values(diary).map((e) => e.place).filter(Boolean))].sort(),
    [diary],
  )
  const [date, setDate] = useState(existing?.date ?? today())

  async function submit(e) {
    e.preventDefault()
    if (!film) {
      setError('Choose a film first.')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Pick the date you watched it.')
      return
    }
    if (date > today()) {
      setError('That date is in the future.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const entry = { date, place: place.trim(), note: note.trim() }
      const message = editing ? `Edit entry: ${film.title} (${film.year})` : `Watched: ${film.title} (${film.year})`
      await onSave(film.id, entry, message)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className="modal-body" onSubmit={submit}>
      <ModalHeader title={editing ? 'Edit entry' : 'Log a screening'} onClose={onClose} />

      <label className="label" htmlFor="film-search">
        Film
      </label>
      {film ? (
        <div className="picked">
          <span>
            {film.title} <span className="muted">({film.year})</span>
          </span>
          {!editing && (
            <button type="button" className="link-button" onClick={() => setFilm(null)}>
              Change
            </button>
          )}
        </div>
      ) : (
        <>
          <input
            id="film-search"
            autoFocus
            autoComplete="off"
            placeholder="Start typing a title"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setError('')
            }}
          />
          {results.length > 0 && (
            <ul className="results">
              {results.map((f) => (
                <li key={f.id}>
                  <button type="button" onClick={() => setFilm(f)}>
                    <span className="result-dots">
                      {f.paths.map((p) => (
                        <span key={p.id} className="dot" style={{ background: p.color.hex }} />
                      ))}
                    </span>
                    {f.title} <span className="muted">({f.year})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && results.length === 0 && <div className="muted small">No unwatched film matches.</div>}
        </>
      )}

      <label className="label" htmlFor="date">
        Watched
      </label>
      <input
        id="date"
        type="date"
        max={today()}
        value={date}
        onChange={(e) => {
          setDate(e.target.value)
          setError('')
        }}
      />

      <label className="label" htmlFor="place">
        Where
      </label>
      <input id="place" list="places" placeholder="Home" value={place} onChange={(e) => setPlace(e.target.value)} />
      <datalist id="places">
        {places.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      <label className="label" htmlFor="note">
        Note
      </label>
      <textarea id="note" rows={4} placeholder="What stayed with you" value={note} onChange={(e) => setNote(e.target.value)} />

      {error && <div className="error">{error}</div>}

      <div className="modal-actions">
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
