import { Command } from './types';

export const commands: Array<Command> = [
  {
    name: 'addallowence',
    description: 'You can add other people to be able to add entries!',
    options: [
      {
        name: 'leaderboardid',
        description: 'To what leaderboard shall the user be added?',
        type: 3,
        required: true
      },
      {
        name: 'user',
        description: 'Who shall be able to interact with your leaderboard?',
        required: true,
        type: 6
      }
    ]
  },
  {
    name: 'allleaderboards',
    description:
      'posts all leaderboards that were created on this discord server'
  },
  {
    name: 'removeallowence',
    description: 'You can remove other people to be able to add entries!',
    options: [
      {
        name: 'leaderboardid',
        description: 'To what leaderboard shall the user be removed?',
        type: 3,
        required: true
      },
      {
        name: 'user',
        description:
          'Who shall not be able to interact with your leaderboard anymore?',
        required: true,
        type: 6
      }
    ]
  },
  {
    name: 'cloneleaderboard',
    description: 'Creates a Leaderboardmessage for your Channel',
    options: [
      {
        name: 'leaderboardid',
        description: 'The ID of the leaderboard that shall be cloned',
        required: true,
        type: 3
      },
      {
        name: 'allentries',
        description:
          'Do you want to see all entries instead of the best per Driver?',
        required: false,
        type: 5
      }
    ]
  },
  {
    name: 'createleaderboard',
    description: 'Creates a Leaderboard and posts it in your Channel',
    options: [
      {
        name: 'leaderboardname',
        description: 'The name of the leaderboard',
        type: 3,
        required: true
      },
      {
        name: 'description',
        description: 'Description of the leaderboard',
        type: 3,
        required: true
      },
      {
        name: 'protected',
        description: 'Should only you be able to add changes?',
        type: 5,
        required: false
      }
    ]
  },
  {
    name: 'deleteleaderboard',
    description: 'Deletes a Leaderboard',
    options: [
      {
        name: 'leaderboardid',
        description: 'Id of the Leaderboard that shall be deleted',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'createentry',
    description: 'Add an entry to the leaderboard',
    options: [
      {
        name: 'leaderboardid',
        description: 'Id of the Leaderboard to which the entry shall be added',
        type: 3,
        required: true
      },
      {
        name: 'time',
        description: 'Time in format MM:SS.mmm',
        type: 3,
        required: true
      },
      {
        name: 'driver',
        description: 'Driver who drove this time defaults to yourself',
        type: 6,
        required: false
      },
      {
        name: 'notes',
        description: 'Any Notes to add? e.g. Car, or conditons',
        type: 3,
        required: false
      }
    ]
  },
  {
    name: 'deleteentry',
    description: 'Deletes an entry from the leaderboard',
    options: [
      {
        name: 'leaderboardid',
        description: 'The leaderboard ID of the entry to be deleted',
        type: 3,
        required: true
      },
      {
        name: 'driver',
        description: 'The driver whose entry to be deleted',
        type: 6,
        required: true
      }
    ]
  }
];
