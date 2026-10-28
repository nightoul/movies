import { formatDate } from '../catalog.js'
import { ModalHeader } from './Modal.jsx'

export default function FilmDetail({ film, entry, onEdit, onUnsee, onClose }) {
  return (
    <>
      <div className="modal-band">
        {film.paths.map((p) => (
          <span key={p.id} style={{ background: p.color.hex }} />
        ))}
      </div>
      <div className="modal-body">
        <ModalHeader title={film.title} subtitle={film.year} onClose={onClose} />

        {entry.seen ? (
          <>
            <div className="label">Seen</div>
            <div>Before the diary, moved here {formatDate(entry.date)}</div>
          </>
        ) : (
          <>
            <div className="facts">
              <div>
                <div className="label">Watched</div>
                <div>{formatDate(entry.date)}</div>
              </div>
              {entry.place && (
                <div>
                  <div className="label">Where</div>
                  <div>{entry.place}</div>
                </div>
              )}
            </div>

            <div className="label">Note</div>
            {entry.note ? <p className="note">{entry.note}</p> : <p className="muted">No note.</p>}
          </>
        )}

        <div className="label">{entry.seen ? 'From paths' : 'On paths'}</div>
        <div className="chips">
          {film.paths.map((p) => (
            <span key={p.id} className="chip">
              <span className="dot" style={{ background: p.color.hex }} />
              {p.name}
            </span>
          ))}
        </div>

        <div className="modal-actions">
          {entry.seen ? <button onClick={onUnsee}>Move back to paths</button> : <button onClick={onEdit}>Edit entry</button>}
        </div>
      </div>
    </>
  )
}
