// Validates the data files. Runs in CI before every deploy.
import { readFileSync } from 'node:fs'
import { filmId } from '../src/films.js'

const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'))
const colors = read('colors.json')
const paths = read('paths.json')
const diary = read('diary.json')

const errors = []
const warnings = []

// Colors: unique ids and hexes, readable white text, used <-> paths in sync.
const allColors = [...colors.used, ...colors.available]
const seen = new Set()
for (const c of allColors) {
  for (const key of ['id', 'hex', 'en', 'cs']) if (!c[key]) errors.push(`Color ${JSON.stringify(c)} is missing "${key}".`)
  if (seen.has(c.id)) errors.push(`Color id "${c.id}" appears more than once.`)
  if (seen.has(c.hex.toLowerCase())) errors.push(`Color hex ${c.hex} appears more than once.`)
  seen.add(c.id)
  seen.add(c.hex.toLowerCase())
  const ratio = contrastWithWhite(c.hex)
  if (ratio < 4.5) warnings.push(`Color "${c.id}" has only ${ratio.toFixed(2)}:1 contrast with white text.`)
}

const pathIds = new Set()
for (const p of paths) {
  if (pathIds.has(p.id)) errors.push(`Path id "${p.id}" appears more than once.`)
  pathIds.add(p.id)
  const used = colors.used.find((c) => c.id === p.color)
  if (!used) errors.push(`Path "${p.id}" uses color "${p.color}", which is not in colors.used.`)
  else if (used.path !== p.id) errors.push(`Color "${p.color}" is marked as used by "${used.path}", not "${p.id}".`)
  if (!Array.isArray(p.films) || p.films.length === 0) warnings.push(`Path "${p.id}" has no films yet.`)

  const ids = new Set()
  for (const f of p.films ?? []) {
    if (!f.title || !Number.isInteger(f.year)) errors.push(`Path "${p.id}" has a film without a title or a whole-number year: ${JSON.stringify(f)}.`)
    const id = filmId(f)
    if (ids.has(id)) errors.push(`Path "${p.id}" lists "${f.title}" (${f.year}) twice.`)
    ids.add(id)
  }
}
for (const c of colors.used) {
  if (!pathIds.has(c.path)) errors.push(`Color "${c.id}" is marked as used by "${c.path}", but no such path exists.`)
}

// The same film spelled differently in two paths would get two diary entries.
const titlesByYear = new Map()
for (const p of paths) {
  for (const f of p.films ?? []) {
    const key = `${f.year}:${f.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    const spellings = titlesByYear.get(key) ?? new Set()
    spellings.add(f.title)
    titlesByYear.set(key, spellings)
  }
}
for (const spellings of titlesByYear.values()) {
  if (spellings.size > 1) errors.push(`One film is spelled differently across paths: ${[...spellings].join(' / ')}.`)
}

// Diary entries must point at a film that exists in some path.
const allFilmIds = new Set(paths.flatMap((p) => (p.films ?? []).map(filmId)))
for (const [id, entry] of Object.entries(diary)) {
  if (!allFilmIds.has(id)) warnings.push(`Diary entry "${id}" does not match any film in a path.`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? '')) errors.push(`Diary entry "${id}" has an invalid date.`)
}

for (const w of warnings) console.warn(`warning: ${w}`)
for (const e of errors) console.error(`error: ${e}`)
console.log(`${paths.length} paths, ${allFilmIds.size} films, ${Object.keys(diary).length} diary entries, ${colors.available.length} colors left.`)
if (errors.length) process.exit(1)

function contrastWithWhite(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return 1.05 / (lum + 0.05)
}
