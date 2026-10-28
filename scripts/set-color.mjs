// Gives a path a color of your choice, or a new random one.
// Usage: npm run set-color -- david-lynch green
//        npm run set-color -- david-lynch        (new random color)
// The path's old color goes back to available. If another path had the
// chosen color, that path gets a new random one.
import { readFileSync, writeFileSync } from 'node:fs'
import { formatPaths } from './format.mjs'
import { pickColor } from './pick-color.mjs'

const [pathId, colorId] = process.argv.slice(2)
const colorsFile = new URL('../src/data/colors.json', import.meta.url)
const pathsFile = new URL('../src/data/paths.json', import.meta.url)
const colors = JSON.parse(readFileSync(colorsFile, 'utf8'))
const paths = JSON.parse(readFileSync(pathsFile, 'utf8'))

const path = paths.find((p) => p.id === pathId)
if (!path) {
  console.error(`No path "${pathId}". Paths: ${paths.map((p) => p.id).join(', ')}`)
  process.exit(1)
}
const all = [...colors.used, ...colors.available]
if (colorId && !all.some((c) => c.id === colorId)) {
  console.error(`No color "${colorId}". Colors: ${all.map((c) => c.id).join(', ')}`)
  process.exit(1)
}
if (colorId === path.color) {
  console.log(`${path.name} already has ${colorId}.`)
  process.exit(0)
}

const release = (id) => {
  const i = colors.used.findIndex((c) => c.id === id)
  const { path: _, ...color } = colors.used.splice(i, 1)[0]
  return color
}
const assign = (p, color) => {
  colors.used.push({ ...color, path: p.id })
  p.color = color.id
  console.log(`${p.name}: ${color.en} / ${color.cs}`)
}

const oldColor = release(path.color)

if (colorId) {
  const owner = paths.find((p) => p.color === colorId)
  const chosen = owner ? release(colorId) : colors.available.splice(colors.available.findIndex((c) => c.id === colorId), 1)[0]
  assign(path, chosen)
  colors.available.push(oldColor)
  if (owner) assign(owner, pickColor(colors))
} else {
  // Picked before the old color is returned, so the path really changes color.
  assign(path, pickColor(colors))
  colors.available.push(oldColor)
}

colors.available.sort((a, b) => a.tier - b.tier)
writeFileSync(colorsFile, JSON.stringify(colors, null, 2) + '\n')
writeFileSync(pathsFile, formatPaths(paths))
