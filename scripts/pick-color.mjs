// Takes a random color from colors.available and removes it from there.
export function pickColor(colors) {
  const color = colors.available[Math.floor(Math.random() * colors.available.length)]
  colors.available.splice(colors.available.indexOf(color), 1)
  return color
}
