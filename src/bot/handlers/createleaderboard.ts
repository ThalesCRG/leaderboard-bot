import * as database from "../../database/database";
import { Command, DataHolder, DiscordDataTypes } from "../../types";

export class CreateLeaderboard {
  name: string;
  description: string;
  protected: boolean;
  constructor(data: DataHolder) {
    this.name = data.getString("leaderboardname", true);
    this.description = data.getString("description", true);
    this.protected = data.getBoolean("protected") || false;
  }
  get isValid() {
    return this.name?.length > 0 && this.description?.length > 0;
  }
}

export default async function (data: DataHolder, user: string, guild: string) {
  const model = new CreateLeaderboard(data);

  if (!model.isValid) {
    return console.error(
      "create leaderboard model is not valid",
      JSON.stringify(model)
    );
  }

  const id = await database.saveLeaderboard(model, user, guild);

  return `Leaderboard with ${id} created.`;
}

export const createLeaderboardOption: Command = {
  name: "createleaderboard",
  description: "Creates a Leaderboard and posts it in your Channel",
  options: [
    {
      name: "leaderboardname",
      description: "The name of the leaderboard",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: "description",
      description: "Description of the leaderboard",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: "protected",
      description: "Can everybody submit a time?",
      type: DiscordDataTypes.BOOLEAN,
      required: false,
    },
  ],
};
