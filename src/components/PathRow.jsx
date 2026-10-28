import { isSeen } from '../catalog.js'

const RING = 2 * Math.PI * 18

export default function PathRow({ path, diary, onOpen, onMarkSeen }) {
  // Films seen before the diary live only in the Seen row.
  const films = path.seen ? path.films : path.films.filter((f) => !isSeen(diary, f.id))
  const watched = films.filter((f) => diary[f.id]).length
  const total = films.length
  const complete = !path.seen && total > 0 && watched === total
  const special = path.shared || path.seen
  const style = special ? undefined : { '--path': path.color.hex, '--path-text': path.color.text }

  return (
    <article className={special ? 'path special' : 'path'} style={style}>
      <div className="path-name">
        <h2>
          {path.name}
          {complete && <span className="complete" title="Path complete"> ★</span>}
        </h2>
        <div className="color-name">
          {path.shared && 'On more than one path'}
          {path.seen && 'Seen before the diary'}
          {!special && (
            <>
              <span className="dot" />
              {path.color.en} · {path.color.cs}
            </>
          )}
        </div>
      </div>

      <div className="strip">
        <div className="strip-inner">
          {films.map((f) =>
            diary[f.id] ? (
              <button key={f.id} className="frame watched" onClick={() => onOpen(f.id)}>
                {special && <PathBand film={f} />}
                <span className="frame-title">{f.title}</span>
                <span className="frame-year">{f.year}</span>
              </button>
            ) : (
              <div
                key={f.id}
                className="frame"
                // A triple click offers to move a film seen before the diary into Seen.
                onClick={onMarkSeen && ((e) => e.detail === 3 && onMarkSeen(f.id))}
              >
                <span className="frame-title">{f.title}</span>
                <span className="frame-year">{f.year}</span>
              </div>
            ),
          )}
          {path.seen && total === 0 && (
            <div className="strip-hint">Triple-click a film you saw before the diary to move it here.</div>
          )}
        </div>
      </div>

      {path.seen ? (
        <div className="seen-count">{total}</div>
      ) : (
        <svg className={complete ? 'ring complete' : 'ring'} viewBox="0 0 44 44" role="img" aria-label={`${watched} of ${total} watched`}>
          <circle className="ring-track" cx="22" cy="22" r="18" />
          <circle
            className="ring-fill"
            cx="22"
            cy="22"
            r="18"
            strokeDasharray={RING}
            strokeDashoffset={total ? RING * (1 - watched / total) : RING}
          />
          <text x="22" y="26" textAnchor="middle">
            {watched}/{total}
          </text>
        </svg>
      )}
    </article>
  )
}

// The colors of every path a film belongs to, across the top of its frame.
function PathBand({ film }) {
  return (
    <span className="frame-band">
      {film.paths.map((p) => (
        <span key={p.id} style={{ background: p.color.hex }} />
      ))}
    </span>
  )
}
