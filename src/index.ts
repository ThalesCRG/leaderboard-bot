import * as database from "./database/database";
import * as bot from "./bot/bot";

require("dotenv").config();

database.initConnection(process.env.DB_URI as string).catch((error) => {
  console.error(`failed to connect to database. closing...`, error);
  process.exit();
});

bot.initConnection(process.env.BOT_TOKEN as string).catch((error) => {
  console.error(`failed to connect to bot api. closing...`, error);
  process.exit();
});
