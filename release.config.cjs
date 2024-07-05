/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', // Analyzes your commit messages and determines the type of version bump
    '@semantic-release/release-notes-generator', // Generates release notes based on commit messages
    '@semantic-release/github', // Creates a GitHub release
  ],
};
