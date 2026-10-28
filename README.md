# A little birthday surprise

A mobile-first birthday story built with plain HTML, CSS, and JavaScript. It has no build step or runtime dependencies.

## Personalize the site

Edit `content.js` to update the wording, balloon message, photo captions and notes, letter, final message, and Spotify track. Add photos to `assets/photos/` and update each photo's `src` path. Sticker assets live in `assets/stickers/`.

## Run locally

Open `index.html` in a browser, or start a local server from this folder:

```sh
python3 -m http.server 3000
```

Then visit `http://localhost:3000`.

## Deploy with GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages when changes are pushed to `main`, or when the workflow is run manually. In the GitHub repository settings, choose **Settings → Pages → Build and deployment → GitHub Actions**.

**Privacy:** this site includes personal photos. GitHub Pages sites are publicly available on the internet, even when the source repository is private. Anyone with the URL can open the site, and the image files can be accessed directly. Only publish if that is okay for everyone pictured. [GitHub Pages visibility details](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Music

The music button opens Spotify's official embedded player. Set `music.spotifyTrackId` and `music.label` in `content.js` to choose a different track. Playback is handled by Spotify and depends on the listener's Spotify account and browser.
