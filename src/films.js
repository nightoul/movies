// A film is identified by its title and year, so the same film listed in
// several paths shares one diary entry. Kept free of browser APIs so the
// Node scripts can import it too.
export function filmId({ title, year }) {
  return `${slugify(title)}-${year}`
}

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
