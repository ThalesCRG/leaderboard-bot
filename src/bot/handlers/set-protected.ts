import {
  CommandInteraction,
  Interaction,
  MessageEmbedOptions,
  WebhookEditMessageOptions,
} from "discord.js";
import { setProtected } from "../../database/database";

export default async function setprotected(
  interaction: Interaction
): Promise<string> {
  if (!interaction) return "There was an error. Please try again";

  const command = interaction as CommandInteraction;

  const userId = command.user.id;

  const leaderboardid = command.options.getString("leaderboardid", true);
  const protectedFlag = command.options.getBoolean("protected", true);

  try {
    await setProtected(leaderboardid, userId, protectedFlag);
    return `Leaderboard ${leaderboardid} is now ${
      protectedFlag ? "protected" : "not protected"
    }`;
  } catch (error) {
    return "There was an error";
  }
}
