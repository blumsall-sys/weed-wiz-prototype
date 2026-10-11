# Weed Wizards v0.4 — GitHub Pages upload guide

## Which ZIP do I need?

**GitHub Pages Upload**: use this SMALL deployment package for testing online. It contains only runtime HTML, CSS, JS, packed sprite atlases, MP3 music, the effects WAVs, app icons and offline service worker. **30 files total**, well below GitHub.com's 100-at-a-time browser-upload limit. The folder tree is still required.

**Complete Windows / Editable Source**: includes the entire game, all source pixel art and individually editable sprites, uncompressed 16-bit audio, the atlas rebuild script, smoke tests and launchers. Use this as your MAIN development copy and backup.

## Update your existing GitHub Pages repository using the website

1. Extract `Weed_Wizards_v0.4_GitHub_Pages_Upload.zip` to a new Windows folder.
2. Open your GitHub repository in Chrome, select `Add file > Upload files` on the repository's **root** directory.
3. Drag the **contents of the extracted folder**, NOT the `.zip` file. Make sure `index.html` ends up in the repository root, with `src/` and `assets/` subfolders preserved.
4. Click **Commit changes**. Wait for the Pages build under `Actions` or `Settings > Pages`.
5. Open `https://YOUR-USERNAME.github.io/YOUR-REPO/`. Refresh twice if you still see the old v0.3 title.

If the browser flattens the folders or otherwise fails to preserve the paths, use **GitHub Desktop** below. You can also drag a folder into the upload drop zone, but avoid uploading a ZIP as a single file (Pages won't unpack it).

### GitHub Desktop — recommended for regular updates, any file count

1. Install GitHub Desktop (https://desktop.github.com/) and sign into your account.
2. File > **Clone repository**. Choose the SAME test repository you already created. Choose a LOCAL empty destination directory.
3. Use File Explorer to **copy the CONTENTS** of the small upload folder into that newly cloned local repository folder, overwriting matching old game files. Keep the `.git` directory and do not replace the entire clone folder.
4. In GitHub Desktop, inspect `Changes`, enter a message such as `Weed Wizards v0.4 voice and quests`, click **Commit to main**, then **Push origin**.
5. Confirm `Settings > Pages > Deploy from a branch > main > /(root)` (unless already configured). Open the site URL.

GitHub's 100-file limit applies to a single browser upload, not GitHub Desktop or normal Git pushes. There is no need to combine every individual sprite into separate files because the game already runs from just SIX packed PNG atlases. Removing old unused source art files is optional; they do not break the game, but you can clean them through GitHub Desktop. Do not delete `assets/sprites/player/down_idle.png` because it is still used on the title screen.

### Windows command-line alternative (existing repo)

```powershell
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
# Copy the CONTENTS of the extracted GitHub Pages Upload folder here.
git add -A
git commit -m "Weed Wizards v0.4 voice and quest update"
git push origin main
```

## How to use narration

- On the title screen, click **Narration OFF** to turn narration on BEFORE starting. The choice persists for new games on that device.
- During gameplay, open **Settings** to enable/disable dialogue and tutorial speech, read new quest objectives, and change speaking speed.
- **Test voice**, **Read current quest** and **Stop** are available; current quest can also be read using the sidebar button.
- Text-to-speech uses the browser/device's Speech Synthesis voices. There are NO external TTS service dependencies, but voice quality, speech support and availability offline depend on the operating system/browser. Some phones require a tap to authorize audio. Speech is OFF by default.
- Music temporarily lowers volume while speech plays. Narration stops when advancing dialogue or returning to title.

## Quest markers

A larger golden exclamation mark labels your CURRENT quest destination, with an edge-of-screen pointer when it is off-camera. Blue marks indicate an exit needed to reach another location. A quest banner across the top opens the journal. You can disable quest markers in Settings. Quest progression is unchanged from v0.3.

## Troubleshooting

- If a title page loads but the sprites are missing, check that `assets/atlas/` contains all SIX PNGs and `atlas-data.js`.
- If an old build loads, do a hard refresh or wait for the new service worker to activate. Do not clear all site data unless necessary: that can erase the browser's local game save.
- Site game saves are separate from Windows file:// saves (different site origins).
- On iPhone use Safari, on Android use Chrome; verify narration and audio on each physical device.
- The lightweight repo contains only the runtime assets. Edit art in the FULL Windows source then run `BUILD_GITHUB_DEPLOY.bat` and upload the regenerated `github-pages-upload/` contents.
