# Guitar Tab Player

A small, dependency-free guitar tab editor and practice player designed for GitHub Pages to mimic Songsterr in its most basic functionality.

## Features

- Open and save `.json` tab files
- Visual six-string tab display that wraps to the available width
- Simple six-string editor
- Add beats and measures
- Tempo control
- 0.5x and 1x playback
- Click individual notes to hear them
- Optional metronome
- Basic synthesized guitar-like playback
- No backend and no build step

## Run locally

Open `index.html` in a browser. For best browser compatibility, you can also serve the directory with any simple static server.

## GitHub Pages

Put the contents of this folder in a repository and enable GitHub Pages for the branch/folder containing `index.html`.

The page uses `assets/logo.svg` and `assets/favicon.ico` for its Green Dream branding, with Orbitron loaded from Google Fonts for the title.

## File format

The application uses JSON. Each measure contains beats, and each beat contains six strings in low-E to high-e order.

An empty string means that string is not played.

Example:

```json
{
  "title": "My Riff",
  "tempo": 100,
  "tuning": ["E", "A", "D", "G", "B", "E"],
  "measures": [
    [
      ["0", "0", "0", "2", "2", "0"],
      ["0", "0", "0", "2", "3", "0"]
    ]
  ]
}
```
