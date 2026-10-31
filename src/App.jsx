import { useCallback, useEffect, useState } from 'react'
import bundledDiary from './data/diary.json'
import { films, paletteSize, paths, seenFilms, sharedPath, today } from './catalog.js'
import { fetchDiary, loadToken, saveEntry, storeToken } from './github.js'
import PathRow from './components/PathRow.jsx'
import Modal from './components/Modal.jsx'
import FilmDetail from './components/FilmDetail.jsx'
import LogForm from './components/LogForm.jsx'
import ConnectForm from './components/ConnectForm.jsx'
import MoveToSeen from './components/MoveToSeen.jsx'
import SeenList from './components/SeenList.jsx'
import DiaryPage from './components/DiaryPage.jsx'

export default function App() {
  const [diary, setDiary] = useState(bundledDiary)
  const [token, setToken] = useState(loadToken)
  // { kind: 'film' | 'log' | 'edit' | 'seen' | 'unsee' | 'seen-list' | 'connect', filmId?, then? }
  const [modal, setModal] = useState(null)

  // The bundled copy can lag a minute behind the last commit while Pages
  // redeploys, so fetch the current diary straight from GitHub.
  useEffect(() => {
    fetchDiary(token)
      .then(({ diary }) => setDiary(diary))
      .catch(() => {})
  }, [token])

  // Two pages, switched by the URL hash so GitHub Pages needs no routing setup.
  const [page, setPage] = useState(readPage)
  useEffect(() => {
    const onHash = () => {
      setPage(readPage())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const close = useCallback(() => setModal(null), [])
  const open = (filmId) => setModal({ kind: 'film', filmId })
  // Actions that save need a token; without one, connect first and carry on after.
  const requireToken = (next) => setModal(token ? next : { kind: 'connect', then: next })

  async function save(filmId, entry, message) {
    const next = await saveEntry(token, filmId, entry, message)
    setDiary(next)
  }

  function connect(newToken) {
    storeToken(newToken)
    setToken(newToken)
    setModal(modal?.then ?? null)
  }

  function disconnect() {
    storeToken('')
    setToken('')
    close()
  }

  const film = modal?.filmId && films.get(modal.filmId)
  const seen = seenFilms(diary)

  return (
    <main className="page">
      <header className="top">
        <nav className="top-nav">
          <a href="#/" className={page === 'paths' ? 'active' : undefined}>
            paths <span className="nav-count">({paths.length}/{paletteSize})</span>
          </a>
          <a href="#/diary" className={page === 'diary' ? 'active' : undefined}>
            diary
          </a>
        </nav>
        <div className="top-date">oct 28 / 2026</div>
        <div className="top-actions">
          {token ? (
            <button className="link-button" onClick={disconnect}>
              Disconnect
            </button>
          ) : (
            <button className="link-button" onClick={() => setModal({ kind: 'connect' })}>
              Connect GitHub
            </button>
          )}
          <button
            className="primary"
            disabled={!token}
            title={token ? undefined : 'Connect GitHub to log screenings'}
            onClick={() => setModal({ kind: 'log' })}
          >
            Log a screening
          </button>
        </div>
      </header>

      {page === 'diary' ? (
        <DiaryPage diary={diary} onOpen={open} />
      ) : (
        <>
          <section className="paths">
            {paths.map((p) => (
              <PathRow
                key={p.id}
                path={p}
                diary={diary}
                onOpen={open}
                onMarkSeen={(filmId) => requireToken({ kind: 'seen', filmId })}
              />
            ))}
          </section>

          <hr className="separator" />

          <PathRow path={sharedPath} diary={diary} onOpen={open} />

          <div className="seen-box" title="Double-click to list" onDoubleClick={() => setModal({ kind: 'seen-list' })}>
            <div>
              <div className="seen-title">Seen</div>
              <div className="color-name">Before the diary</div>
            </div>
            <div className="seen-count">{seen.length}</div>
          </div>
        </>
      )}

      {modal && (
        <Modal wide={modal.kind === 'seen-list'} onClose={close}>
          {modal.kind === 'film' && (
            <FilmDetail
              film={film}
              entry={diary[modal.filmId]}
              onEdit={() => requireToken({ kind: 'edit', filmId: modal.filmId })}
              onUnsee={() => requireToken({ kind: 'unsee', filmId: modal.filmId })}
              onClose={close}
            />
          )}
          {(modal.kind === 'log' || modal.kind === 'edit') && (
            <LogForm
              diary={diary}
              editing={modal.kind === 'edit' ? film : null}
              onSave={async (filmId, entry, message) => {
                await save(filmId, entry, message)
                setModal({ kind: 'film', filmId })
              }}
              onClose={close}
            />
          )}
          {(modal.kind === 'seen' || modal.kind === 'unsee') && (
            <MoveToSeen
              film={film}
              back={modal.kind === 'unsee'}
              onConfirm={async () => {
                const label = `${film.title} (${film.year})`
                if (modal.kind === 'seen') await save(film.id, { date: today(), seen: true }, `Seen before: ${label}`)
                else await save(film.id, null, `Back to paths: ${label}`)
                close()
              }}
              onClose={close}
            />
          )}
          {modal.kind === 'seen-list' && <SeenList films={seen} onOpen={open} onClose={close} />}
          {modal.kind === 'connect' && <ConnectForm onConnect={connect} onClose={close} />}
        </Modal>
      )}
    </main>
  )
}

function readPage() {
  return window.location.hash === '#/diary' ? 'diary' : 'paths'
}
