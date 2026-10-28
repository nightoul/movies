import { useEffect, useState } from 'react'
import bundledDiary from './data/diary.json'
import { films, paths, today } from './catalog.js'
import { fetchDiary, loadToken, saveEntry, storeToken } from './github.js'
import PathRow from './components/PathRow.jsx'
import Modal from './components/Modal.jsx'
import FilmDetail from './components/FilmDetail.jsx'
import LogForm from './components/LogForm.jsx'
import ConnectForm from './components/ConnectForm.jsx'

export default function App() {
  const [diary, setDiary] = useState(bundledDiary)
  const [token, setToken] = useState(loadToken)
  // { kind: 'film' | 'log' | 'edit' | 'connect', filmId?, then? }
  const [modal, setModal] = useState(null)

  // The bundled copy can lag a minute behind the last commit while Pages
  // redeploys, so fetch the current diary straight from GitHub.
  useEffect(() => {
    fetchDiary(token)
      .then(({ diary }) => setDiary(diary))
      .catch(() => {})
  }, [token])

  const month = today().slice(0, 7)
  const thisMonth = Object.values(diary).filter((e) => e.date.startsWith(month)).length
  const close = () => setModal(null)

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

  return (
    <main className="page">
      <header className="top">
        <div className="stat">
          <div className="stat-label">This month</div>
          <div className="stat-value">{thisMonth}</div>
        </div>
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

      <section className="paths">
        {paths.map((p) => (
          <PathRow key={p.id} path={p} diary={diary} onOpen={(filmId) => setModal({ kind: 'film', filmId })} />
        ))}
      </section>

      {modal && (
        <Modal onClose={close}>
          {modal.kind === 'film' && (
            <FilmDetail
              film={films.get(modal.filmId)}
              entry={diary[modal.filmId]}
              onEdit={() => setModal(token ? { kind: 'edit', filmId: modal.filmId } : { kind: 'connect', then: { kind: 'edit', filmId: modal.filmId } })}
              onClose={close}
            />
          )}
          {(modal.kind === 'log' || modal.kind === 'edit') && (
            <LogForm
              diary={diary}
              editing={modal.kind === 'edit' ? films.get(modal.filmId) : null}
              onSave={async (filmId, entry, message) => {
                await save(filmId, entry, message)
                setModal({ kind: 'film', filmId })
              }}
              onClose={close}
            />
          )}
          {modal.kind === 'connect' && (
            <ConnectForm onConnect={connect} onClose={close} />
          )}
        </Modal>
      )}
    </main>
  )
}
