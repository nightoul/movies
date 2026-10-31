import colors from './data/colors.json'
import pathsData from './data/paths.json'
import { textOn } from './colors.js'
import { filmId } from './films.js'

// Every path takes one color, so the palette size is how many paths fit.
export const paletteSize = colors.used.length + colors.available.length

const colorById =Object.fromEntries(colors.used.map((c) => [c.id, { ...c, text: textOn(c.hex) }]))

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

const byYear = (a, b) => a.year - b.year || a.title.localeCompare(b.title)

// Below the paths: films that appear on more than one path.
export const sharedPath = {
  id: 'shared',
  name: 'Shared films',
  shared: true,
  films: [...films.values()].filter((f) => f.paths.length > 1).sort(byYear),
}

// Films seen before the diary. They're marked in the diary with `seen: true`
// and drop out of every row.
export function seenFilms(diary) {
  return [...films.values()].filter((f) => isSeen(diary, f.id)).sort(byYear)
}

export function isSeen(diary, filmId) {
  return Boolean(diary[filmId]?.seen)
}

export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
