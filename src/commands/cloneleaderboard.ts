import { CommandInteraction, Interaction } from "discord.js";
import { getLeaderboard } from "../utils/dataUtils";
import {
  printFilteredLeaderboard,
  printLeaderboard,
} from "../utils/messageUtils";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  const command = interaction as CommandInteraction;
  const leaderboardId = command.options.getString("leaderboardid");

  if (!leaderboardId) return;

  const leaderboard = await getLeaderboard(leaderboardId);
  if (!leaderboard) return;

  if (!command.channel) return;

  if (command.options.getBoolean("allentries"))
    await printLeaderboard(leaderboard, command.channel);
  else await printFilteredLeaderboard(leaderboard, command.channel);
}

// {
//     name: "cloneleaderboard",
//     description: "Creates a Leaderboardmessage for your Channel",
//     options: [
//       {
//         name: "leaderboardid",
//         description: "The ID of the leaderboard that shall be cloned",
//         required: true,
//         type: 3,
//       },
//     ],
//   },
