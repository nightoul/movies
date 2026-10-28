import { useState } from 'react'
import { ModalHeader } from './Modal.jsx'

// Confirms moving a film into Seen, or back out of it to its paths.
export default function MoveToSeen({ film, back, onConfirm, onClose }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const names = film.paths.map((p) => p.name).join(', ')

  async function confirm() {
    setSaving(true)
    setError('')
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-body">
      <ModalHeader title={back ? 'Move back to paths?' : 'Move to Seen?'} onClose={onClose} />
      <p>
        {film.title} <span className="muted">({film.year})</span>
      </p>
      <p className="muted small">
        {back ? `It returns to ${names} as unwatched.` : `It leaves ${names}.`}
      </p>
      {error && <div className="error">{error}</div>}
      <div className="modal-actions">
        <button onClick={onClose}>Cancel</button>
        <button className="primary" onClick={confirm} disabled={saving} autoFocus>
          {saving ? 'Saving…' : 'Yes'}
        </button>
      </div>
    </div>
  )
}
