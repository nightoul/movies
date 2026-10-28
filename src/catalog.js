import colors from './data/colors.json'
import pathsData from './data/paths.json'
import { filmId } from './films.js'

const colorById = Object.fromEntries(colors.used.map((c) => [c.id, c]))

export const paths = pathsData.map((p) => ({
  ...p,
  color: colorById[p.color],
  films: p.films.map((f) => ({ ...f, id: filmId(f) })),
}))

// Every film once, with the paths it appears on.
export const films = new Map()
for (const p of paths) {
  for (const f of p.films) {
    const film = films.get(f.id) ?? { id: f.id, title: f.title, year: f.year, paths: [] }
    film.paths.push(p)
    films.set(f.id, film)
  }
}

export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
