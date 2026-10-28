// A film is identified by its title and year, so the same film listed in
// several paths shares one diary entry. Kept free of browser APIs so the
// Node scripts can import it too.
export function filmId({ title, year }) {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug}-${year}`
}

export function slugify(text) {
  return filmId({ title: text, year: '' }).replace(/-$/, '')
}
