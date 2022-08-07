# Leaderboard Bot

Discord bot to manage and publish leaderboards for sim-racing challenges

![sample bot answer](https://i.imgur.com/soq1C5y.png)

## setup

install dependencies with `npm install`

rename `.example.env` to `.env` and provide necessary values or 
create `.env` with

```
BOT_TOKEN=
DB_URI=
```

The `DB_URI` needs to be a mongoDB Connection String URI.
`BOT_TOKEN` can be aquired on the [Discord Developer Portal](https://discord.com/developers/applications)

## run

`npm start` or `npm run watch`

### dev tools

vscode
mongodb

extensions:

- prettier
