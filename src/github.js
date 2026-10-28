// The diary lives in the repo itself. Reading works without a token (the repo
// is public); saving commits the updated file through the GitHub contents API.
const REPO = 'nightoul/movies'
const BRANCH = 'master'
const DIARY_PATH = 'src/data/diary.json'
const TOKEN_KEY = 'movies.githubToken'
const API = `https://api.github.com/repos/${REPO}/contents/${DIARY_PATH}`

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function storeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Private windows can block storage; the token then lasts for this visit only.
  }
}

export async function fetchDiary(token) {
  const res = await fetch(`${API}?ref=${BRANCH}`, { headers: headers(token), cache: 'no-store' })
  if (!res.ok) throw new GitHubError(res.status)
  const body = await res.json()
  return { diary: JSON.parse(decode(body.content)), sha: body.sha }
}

// Always starts from the latest committed diary, so an entry saved from
// another device is never overwritten.
export async function saveEntry(token, filmId, entry, message) {
  const latest = await fetchDiary(token)
  const diary = sortKeys({ ...latest.diary, [filmId]: entry })
  const res = await fetch(API, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      branch: BRANCH,
      sha: latest.sha,
      content: encode(JSON.stringify(diary, null, 2) + '\n'),
    }),
  })
  if (!res.ok) throw new GitHubError(res.status)
  return diary
}

export async function checkToken(token) {
  const res = await fetch(`https://api.github.com/repos/${REPO}`, { headers: headers(token) })
  if (!res.ok) throw new GitHubError(res.status)
  const repo = await res.json()
  if (!repo.permissions?.push) throw new GitHubError(403)
}

export class GitHubError extends Error {
  constructor(status) {
    super(
      status === 401
        ? 'GitHub rejected the token. Connect again with a new one.'
        : status === 403 || status === 404
          ? 'This token can’t write to the repo. Give it Contents: read and write on nightoul/movies.'
          : status === 409
            ? 'The diary changed on GitHub at the same moment. Try saving again.'
            : `GitHub returned an error (${status}). Try again in a moment.`,
    )
    this.status = status
  }
}

function headers(token) {
  const h = { Accept: 'application/vnd.github+json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function sortKeys(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]))
}

function encode(text) {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decode(base64) {
  const binary = atob(base64.replace(/\n/g, ''))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}
