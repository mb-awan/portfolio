import type { Data } from 'use-lanyard';

import { HttpResponse, http } from 'msw';

/**
 * @description This mock url is associated with retrieving discord presence data
 **/
export const fetchDiscordMockUrl = 'https://api.lanyard.rest/socket';

/**
 * This mock data is associated with the discord presence endpoint
 * @url https://api.lanyard.rest/socket
 **/
export const discordMockData: Data = {
  active_on_discord_desktop: true,
  active_on_discord_mobile: false,
  active_on_discord_web: false,
  activities: [
    {
      application_id: '782685898163617802',
      assets: {
        large_image:
          'mp:external/ByjawWsm2QtMAOa2doThD3bIfP42xs9pmNqRE9rs1X4/https/raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/idle-vscode.png',
        large_text: 'Idle in Visual Studio Code',
        small_image:
          'mp:external/Y6xAhARpHfRM8Bkdw0a1ZkbTAIXqKJFmrSAvHjKs6B0/https/raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/idle.png',
        small_text: 'Snoozin...',
      },
      created_at: 1714978701660,
      details: 'Not in a file!',
      flags: 1,
      id: 'b671368b1bcb6d12',
      name: 'Code',
      session_id: '0147d155db86b978b04d5191fc683733',
      state: '',
      timestamps: {
        end: 1714978701660,
        start: 1714961677077,
      },
      type: 0,
    },
  ],
  discord_status: 'online',
  discord_user: {
    avatar: 'a82de14dd010516485c5d2b0ad768bc0',
    avatar_decoration_data: null,
    bot: false,
    discriminator: '0',
    display_name: 'edwinhern',
    global_name: 'edwinhern',
    id: '196399908771725312',
    public_flags: 256,
    username: 'edwinhern',
  },
  kv: {},
  listening_to_spotify: false,
  spotify: null,
};

export const fetchDiscordHandler = http.get(fetchDiscordMockUrl, () => HttpResponse.json(discordMockData));
