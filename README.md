# Film Diary

A one-page diary for watching films along "paths" (a director, an actor, an era, a genre). Each path is a film strip: watched films light up in the path's color, and clicking one shows when and where you watched it and your note.

Live at https://nightoul.github.io/movies/

## Data

Everything lives in `src/data/`:

| File | What it holds | Who edits it |
| --- | --- | --- |
| `paths.json` | The paths, in the order they appear on the page, and their films (`title` + `year`) | You, by hand |
| `colors.json` | The color palette: `used` colors (each tied to a path) and `available` ones waiting for a new path | `npm run new-path` |
| `diary.json` | Your entries, keyed by film id: `date`, `place`, `note`, or `date` + `seen: true` for films seen before the diary | The site, by committing through the GitHub API |

A film is identified by its title and year, so the same film in two paths (*Chinatown* in Jack Nicholson and '70s classics) shares one entry. Spell it the same way in both; `npm run check` catches mismatches.

## Diary

The **diary** link in the top left opens `#/diary`: every film you logged, newest first and grouped by month, with where you watched it and your note. Films moved to Seen aren't listed there.

## Seen

Below the paths is a row the site builds itself, **Shared films** (on more than one path), and under it a quiet `seen / N` count. Triple-click an unwatched film you saw before you started the diary and confirm, and it moves to Seen and leaves every path it was on. Double-click the count to list them; open one there to move it back.

## Adding a path

```bash
npm run new-path -- "Stanley Kubrick"
```

This picks a random unused color, moves it from `available` to `used`, and appends an empty path to `paths.json`. The palette is a fixed set of 37 colors grouped into families (bright reds, deep reds, oranges, browns, yellows, greens, blue-greens, blues, purples, pinks, greys), each with an English and a Czech name. Light colors get dark frame text automatically. To add more, append entries with `id`, `hex`, `en`, `cs` and `family` to `available`. To give a path a color of your choice, or a new random one:

```bash
npm run set-color -- film-noir burgundy
npm run set-color -- jack-nicholson
```

The old color goes back to `available`, and if another path had the chosen color, that path gets a new random one.

Then fill in its films, move the path to wherever you want it on the page, and check:

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
