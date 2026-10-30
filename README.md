# Timesheet app

The site is published at <https://sigfriedjk.github.io/timesheet-app/>.

## GitHub Pages deployment

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the
   build and deployment source.
2. Merge the deployment workflow into `main`. Every push to `main` will then
   publish the site automatically.
3. To deploy again without a code change, open **Actions → Deploy to GitHub
   Pages → Run workflow** and select `main`.

The workflow publishes `index.html`, `unlock.js`, and `payload.json` directly;
no build command or additional secrets are required. The encrypted payload is
deployed as stored in the repository, and visitors unlock it in their browser.
Deployment progress and the published URL are available in the workflow run.
