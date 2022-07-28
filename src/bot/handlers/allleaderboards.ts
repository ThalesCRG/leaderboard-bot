import { CommandInteraction, Interaction } from "discord.js";
import { getAllLeaderboardsOfGuild } from "../../database/database";
import { printFilteredLeaderboard } from "../../utils/messageUtils";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  const command = interaction as CommandInteraction;

  const guildId = command.guildId;
  if (!guildId) throw new Error("Could not find guild");

  const leaderboards = await getAllLeaderboardsOfGuild(guildId);
  const channel = command.channel;

  if (!channel) throw new Error("Could not find channel");
  for (const leaderboard of leaderboards) {
    printFilteredLeaderboard(leaderboard, channel);
  }
}
