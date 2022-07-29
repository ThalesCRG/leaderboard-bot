import { CommandInteraction, Interaction } from "discord.js";
import { getLeaderboard } from "../../database/database";
import {
  printFilteredLeaderboard,
  printLeaderboard,
} from "../../utils/messageUtils";

export default async function (interaction: Interaction): Promise<string> {
  if (!interaction) return "There was an error. Please try again";
  const command = interaction as CommandInteraction;
  const leaderboardId = command.options.getString("leaderboardid");

  if (!leaderboardId) return "There was an error. Please try again";

  const leaderboard = await getLeaderboard(leaderboardId);
  if (!leaderboard) return "There was an error. Please try again";

  if (!command.channel) return "There was an error. Please try again";

  if (command.options.getBoolean("allentries"))
    await printLeaderboard(leaderboard, command.channel);
  else await printFilteredLeaderboard(leaderboard, command.channel);
  return "👍";
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
