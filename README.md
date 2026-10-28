# Film Diary

A one-page diary for watching films along "paths" (a director, an actor, an era, a genre). Each path is a film strip: watched films light up in the path's color, and clicking one shows when and where you watched it and your note.

Live at https://nightoul.github.io/movies/

## Data

Everything lives in `src/data/`:

| File | What it holds | Who edits it |
| --- | --- | --- |
| `paths.json` | The paths, in the order they appear on the page, and their films (`title` + `year`) | You, by hand |
| `colors.json` | The color palette: `used` colors (each tied to a path) and `available` ones waiting for a new path | `npm run new-path` |
| `diary.json` | Your entries, keyed by film id: `date`, `place`, `note` | The site, by committing through the GitHub API |

A film is identified by its title and year, so the same film in two paths (*Chinatown* in Jack Nicholson and '70s classics) shares one entry. Spell it the same way in both; `npm run check` catches mismatches.

## Adding a path

```bash
npm run new-path -- "Stanley Kubrick"
```

This picks a random unused color, moves it from `available` to `used`, and appends an empty path to `paths.json`. Then fill in its films, move the path to wherever you want it on the page, and check:

```bash
npm run check
```

## Saving entries

The site saves by committing `src/data/diary.json` to this repo. The first time, click **Connect GitHub** and paste a fine-grained token with access to only this repo and **Contents: Read and write**. The token stays in that browser's local storage.

Every commit redeploys the site, but the page also reads the diary straight from GitHub, so a new entry shows up right away.

## Development

```bash
npm install
npm run dev
```

Pushing to `master` runs `check`, `lint` and `build`, then deploys to GitHub Pages.
