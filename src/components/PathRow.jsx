const RING = 2 * Math.PI * 18

export default function PathRow({ path, diary, onOpen }) {
  const watched = path.films.filter((f) => diary[f.id]).length
  const total = path.films.length
  const complete = total > 0 && watched === total

  return (
    <article className="path" style={{ '--path': path.color.hex }}>
      <div className="path-name">
        <h2>
          {path.name}
          {complete && <span className="complete" title="Path complete"> ★</span>}
        </h2>
        <div className="color-name">
          <span className="dot" />
          {path.color.en} · {path.color.cs}
        </div>
      </div>

      <div className="strip">
        <div className="strip-inner">
          {path.films.map((f) =>
            diary[f.id] ? (
              <button key={f.id} className="frame watched" onClick={() => onOpen(f.id)}>
                <span className="frame-title">{f.title}</span>
                <span className="frame-year">{f.year}</span>
              </button>
            ) : (
              <div key={f.id} className="frame">
                <span className="frame-title">{f.title}</span>
                <span className="frame-year">{f.year}</span>
              </div>
            ),
          )}
        </div>
      </div>

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
    </article>
  )
}
