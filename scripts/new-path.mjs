// Adds an empty path and gives it a random unused color, basic colors first.
// Usage: npm run new-path -- "David Lynch"
import { readFileSync, writeFileSync } from 'node:fs'
import { slugify } from '../src/films.js'
import { formatPaths } from './format.mjs'
import { pickColor } from './pick-color.mjs'

const name = process.argv.slice(2).join(' ').trim()
if (!name) {
  console.error('Usage: npm run new-path -- "Path name"')
  process.exit(1)
}

const colorsFile = new URL('../src/data/colors.json', import.meta.url)
const pathsFile = new URL('../src/data/paths.json', import.meta.url)
const colors = JSON.parse(readFileSync(colorsFile, 'utf8'))
const paths = JSON.parse(readFileSync(pathsFile, 'utf8'))

const id = slugify(name)
if (paths.some((p) => p.id === id)) {
  console.error(`A path with id "${id}" already exists.`)
  process.exit(1)
}
if (colors.available.length === 0) {
  console.error('No colors left. Add more to src/data/colors.json first.')
  process.exit(1)
}

const color = pickColor(colors)
colors.used.push({ ...color, path: id })
paths.push({ id, name, color: color.id, films: [] })

writeFileSync(colorsFile, JSON.stringify(colors, null, 2) + '\n')
writeFileSync(pathsFile, formatPaths(paths))

console.log(`Added "${name}" (${id}) with color ${color.en} / ${color.cs} ${color.hex}.`)
console.log(`${colors.available.length} colors left. Now add its films in src/data/paths.json.`)
