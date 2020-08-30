# FrogBot

To get started, you must have the following requirements:
- NodeJS installed on the hosting computer/server
- A bot application registered with Discord

You must also have the following files:
- steam-users.json
- auth.json
- package.json 

To run, do the following:
- run `npm install` (only the first time to initialize the modules)
  - Should you need to update modules, run `npm update`
- run `node bot.js`

Current functioning commands:

| Command | Arguments | Purpose |
|---|---|---|
| ping | none | Test if the bot is online |
| hi | none | Reply with a fun "Hi!" message |
| introduce | none | Give a quick explanation of its purpose |
| myGames | [discord name] | Lists all Steam games that user owns (2000 character limit) |
| compare | [store] [user1] [user2] [--force-update] | Finds games from the platform that both players own. |
| register | [store] [username] [id] | Stores information about the plater for the platform |

Commands in development:

| Command | Arguments | Purpose |
|---|---|---|
| free | [store] | Finds all free games listed on that platform |

**Currently, only the Steam platform is supported. This will be expanded to more platforms in the future.**