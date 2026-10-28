import { ModalHeader } from './Modal.jsx'

// The films seen before the diary, opened by double-clicking the Seen count.
export default function SeenList({ films, onOpen, onClose }) {
  return (
    <div className="modal-body">
      <ModalHeader title="Seen" subtitle="Before the diary" onClose={onClose} />
      {films.length === 0 ? (
        <p className="muted small">Nothing yet. Triple-click an unwatched film to move it here.</p>
      ) : (
        <ul className="results seen-list">
          {films.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => onOpen(f.id)}>
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
    </div>
  )
}
