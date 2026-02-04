import type { User } from './types.ts';
import type { Message } from './types.ts';
import girl from '../assets/girl.jpg';

const messages = [
  {
    id: '0',
    message:
      "Yo, you up for a match of Pong later tonight? I'm trying to climb the leaderboard.",
    time: '10:30 pm',
    isSent: false,
  },
  {
    id: '1',
    message: 'For sure! I need to practice my serves. What time works for you?',
    time: '10:31 pm',
    isSent: true,
  },
  {
    id: '2',
    message: 'How about 9 PM? Should give us enough time for a few games.',
    time: '10:32 pm',
    isSent: false,
  },
] satisfies Message[];

export const users = [
  {
    id: '0',
    avatar: girl,
    username: 'CyberNinja',
    status: 'online',
    interaction: messages,
  },
  {
    id: '1',
    avatar: girl,
    username: 'YellowEyes',
    status: 'offline',
    interaction: messages,
  },
  {
    id: '2',
    avatar: girl,
    username: 'MarioLopez',
    status: 'online',
    interaction: messages,
  },
] satisfies User[];
