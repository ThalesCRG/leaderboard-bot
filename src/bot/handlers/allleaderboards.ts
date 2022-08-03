import { CommandInteraction, Interaction } from "discord.js";
import { getAllLeaderboardsOfGuild } from "../../database/database";
import { printFilteredLeaderboard } from "../../utils/messageUtils";

export default async function (interaction: Interaction): Promise<string> {
  if (!interaction) return "There was an error. Please try again";
  const command = interaction as CommandInteraction;

  const guildId = command.guildId;
  if (!guildId) return "This command is only available on Discord Servers not on DMs";

  const leaderboards = await getAllLeaderboardsOfGuild(guildId);
  const channel = command.channel;

  if (!channel) return "There was an error. Please try again";
  for (const leaderboard of leaderboards) {
    printFilteredLeaderboard(leaderboard, channel);
  }
  return "👍";
}
