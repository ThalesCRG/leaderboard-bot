import { CommandInteraction, Interaction } from "discord.js";
import { getUserLeaderboards } from "../../database/database";
import { printFilteredLeaderboard } from "../../utils/messageUtils";

export async function myleaderboards(interaction: Interaction) {
  if (!interaction) return "Could not resolve interaction";

  const command = interaction as CommandInteraction;

  const userId = command.user.id;
  const channel = command.user.dmChannel
    ? command.user.dmChannel
    : await command.user.createDM(true);

  if (!channel) return "Could not resolve channel";

  const leaderboards = await getUserLeaderboards(userId);

  for (const leaderboard of leaderboards) {
    printFilteredLeaderboard(leaderboard, channel);
  }
  return "I send you a DM!";
}
