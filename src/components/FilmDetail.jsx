import { formatDate } from '../catalog.js'
import { ModalHeader } from './Modal.jsx'

export default function FilmDetail({ film, entry, onEdit, onClose }) {
  return (
    <>
      <div className="modal-band">
        {film.paths.map((p) => (
          <span key={p.id} style={{ background: p.color.hex }} />
        ))}
      </div>
      <div className="modal-body">
        <ModalHeader title={film.title} subtitle={film.year} onClose={onClose} />

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

        <div className="label">On paths</div>
        <div className="chips">
          {film.paths.map((p) => (
            <span key={p.id} className="chip">
              <span className="dot" style={{ background: p.color.hex }} />
              {p.name}
            </span>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onEdit}>Edit note</button>
        </div>
      </div>
    </>
  )
}
