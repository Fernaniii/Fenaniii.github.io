/*
 * Settings for the #repositories section.
 *
 * Pinned repos come from data/pinned.json, which the GitHub Action in
 * .github/workflows/pinned-repos.yml refreshes from your real GitHub pins.
 * Recent activity is loaded live from the public GitHub API.
 *
 *   user          GitHub username
 *   recentCount   How many recently pushed repos to list (forks/archived are skipped)
 *   exclude       Repo names to hide from Recent Activity, e.g. ['scratch-notes']
 */
window.REPO_CONFIG = {
  user: 'Fernaniii',
  recentCount: 6,
  exclude: []
};
