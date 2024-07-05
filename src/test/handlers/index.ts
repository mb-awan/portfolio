import { fetchDiscordHandler } from '@/test/mocks/discord';
import { fetchGithubHandler } from '@/test/mocks/github';

export const handlers = [fetchGithubHandler, fetchDiscordHandler];
