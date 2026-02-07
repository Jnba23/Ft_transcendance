import type { User } from './types.ts';
import type { Message } from './types.ts';
import girl from '../assets/girl.jpg';
import { FriendRequest } from 'types/friendRequest';

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
  {
    id: '3',
    message: 'Sorry I can\'t. I just remembered I have to walk my dog.',
    time: '10:40 pm',
    isSent: true,
  },
  {
    id: '4',
    message: 'It\'s fine. We can do it another time.',
    time: '10:41 pm',
    isSent: false,
  },
  {
    id: '5',
    message: 'Cool! Just remember that i love time traveling with you!',
    time: '10:42 pm',
    isSent: true,
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

export const mockSentRequests: FriendRequest[] = [
  {
    id: 101,
    user_id_1: 1,
    user_id_2: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export const mockReceivedRequests: FriendRequest[] = [
  {
    id: 201,
    user_id_1: 77,
    user_id_2: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 202,
    user_id_1: 88,
    user_id_2: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];
