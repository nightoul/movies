// Writes paths.json with one film per line, so long paths stay easy to edit by hand.
export function formatPaths(paths) {
  const blocks = paths.map((p) => {
    const films = p.films.map((f) => `      ${JSON.stringify({ title: f.title, year: f.year })}`).join(',\n')
    return [
      '  {',
      `    "id": ${JSON.stringify(p.id)},`,
      `    "name": ${JSON.stringify(p.name)},`,
      `    "color": ${JSON.stringify(p.color)},`,
      films ? `    "films": [\n${films}\n    ]` : '    "films": []',
      '  }',
    ].join('\n')
  })
  return `[\n${blocks.join(',\n')}\n]\n`
}
