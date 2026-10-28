import { useState } from 'react'
import { checkToken } from '../github.js'
import { ModalHeader } from './Modal.jsx'

const NEW_TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'

export default function ConnectForm({ connected, onConnect, onDisconnect, onClose }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!token.trim()) {
      setError('Paste a token first.')
      return
    }
    setChecking(true)
    try {
      await checkToken(token.trim())
      onConnect(token.trim())
    } catch (err) {
      setError(err.message)
      setChecking(false)
    }
  }

  if (connected) {
    return (
      <div className="modal-body">
        <ModalHeader title="Connected to GitHub" onClose={onClose} />
        <p className="muted">Entries you log are committed to the diary in the nightoul/movies repo.</p>
        <div className="modal-actions">
          <button onClick={onDisconnect}>Disconnect</button>
        </div>
      </div>
    )
  }

  return (
    <form className="modal-body" onSubmit={submit}>
      <ModalHeader title="Connect GitHub" onClose={onClose} />
      <p className="muted small">
        Your diary is saved as a commit to the repo. This browser needs a token to do that, once.
      </p>
      <ol className="steps small">
        <li>
          Open <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">new fine-grained token</a>.
        </li>
        <li>Repository access: only <strong>nightoul/movies</strong>.</li>
        <li>Permissions: <strong>Contents</strong> → Read and write.</li>
        <li>Generate it and paste it here.</li>
      </ol>
      <label className="label" htmlFor="token">
        Token
      </label>
      <input
        id="token"
        type="password"
        autoComplete="off"
        placeholder="github_pat_…"
        value={token}
        onChange={(e) => {
          setToken(e.target.value)
          setError('')
        }}
      />
      <div className="muted small">Stored only in this browser.</div>
      {error && <div className="error">{error}</div>}
      <div className="modal-actions">
        <button type="submit" className="primary" disabled={checking}>
          {checking ? 'Checking…' : 'Connect'}
        </button>
      </div>
    </form>
  )
}
