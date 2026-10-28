// Takes a random color from the most familiar tier that still has colors left
// (1 = basic colors, 2 = common shades, 3 = less known names) and removes it
// from colors.available.
export function pickColor(colors) {
  const tier = Math.min(...colors.available.map((c) => c.tier))
  const candidates = colors.available.filter((c) => c.tier === tier)
  const color = candidates[Math.floor(Math.random() * candidates.length)]
  colors.available.splice(colors.available.indexOf(color), 1)
  return color
}
