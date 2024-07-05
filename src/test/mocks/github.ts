import { HttpResponse, http } from 'msw';

/**
 * @description This mock url is associated with retrieving pinned repositories
 **/
export const fetchGithubMockUrl = 'https://gh-pinned-repos-tsj7ta5xfhep.deno.dev/';

/**
 * This mock data is associated with the GitHub pinned repositories endpoint
 * @url https://gh-pinned-repos-tsj7ta5xfhep.deno.dev/
 **/
export const githubMockData: GithubRepo[] = [
  {
    description: 'Express + TypeScript + Boilerplate for Web / API App',
    forks: 40,
    image: 'https://opengraph.githubassets.com/1/edwinhern/express-typescript-2024',
    language: 'TypeScript',
    languageColor: '#3178c6',
    link: 'https://github.com/edwinhern/express-typescript-2024',
    owner: 'edwinhern',
    repo: 'express-typescript-2024',
    stars: 208,
    website: 'https://express.hernandezserver.com/',
  },
  {
    description: '',
    forks: 0,
    image: 'https://opengraph.githubassets.com/1/edwinhern/next-template-2024',
    language: 'TypeScript',
    languageColor: '#3178c6',
    link: 'https://github.com/edwinhern/next-template-2024',
    owner: 'edwinhern',
    repo: 'next-template-2024',
    stars: 0,
    website: 'https://next-template-2024.vercel.app',
  },
];

export const fetchGithubHandler = http.get(fetchGithubMockUrl, ({ request }) => {
  const url = new URL(request.url);
  const userName = url.searchParams.get('username');
  if (!userName) {
    return new HttpResponse(null, { status: 404 });
  }

  return HttpResponse.json(githubMockData);
});
