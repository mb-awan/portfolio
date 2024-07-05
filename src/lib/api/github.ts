import wretch from 'wretch';

// Configure API URL from environment
const apiUrl = 'https://gh-pinned-repos-tsj7ta5xfhep.deno.dev';
const githubUsername = 'mb-awan';

// Create a wretch instance configured for API interactions
const api = wretch(apiUrl, {
  cache: 'no-store',
  mode: 'cors',
})
  .errorType('json')
  .resolve((resolver) => resolver.json() as Promise<GithubRepo[]>);

// Function to fetch pinned repository
export const fetchGithubRepos = async () => {
  const response = await api.get(`?username=${githubUsername}`);
  return response || [];
};
