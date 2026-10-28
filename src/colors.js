// Shared by the app and the Node scripts, so no browser APIs here.
const LIGHT_TEXT = '#ffffff'
const DARK_TEXT = '#1c1917'

export function contrast(a, b) {
  const [la, lb] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (la + 0.05) / (lb + 0.05)
}

// Light colors like yellow or beige get dark text, the rest white.
export function textOn(hex) {
  return contrast(hex, LIGHT_TEXT) >= contrast(hex, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
