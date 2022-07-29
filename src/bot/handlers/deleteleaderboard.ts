import { CommandInteraction, Interaction } from "discord.js";
import { deleteLeaderboard } from "../../database/database";

export default async function (interaction: Interaction): Promise<string> {
  if (!interaction) return "There was an error. Please try again";
  const command = interaction as CommandInteraction;

  const user = command.user.id;
  if (!user) return "There was an error. Please try again";

  const leaderboardId = command.options.getString("leaderboardid");
  if (!leaderboardId) return "Error: LeaderboardID not provided";

  try {
    await deleteLeaderboard(leaderboardId, user);
    return `Deleted Leaderboard ${leaderboardId}`;
  } catch (error) {
    console.log(error);
    return "There was an error. Please try again";
  }
}

//  {
//     name: "deleteleaderboard",
//     description: "Deletes a Leaderboard",
//     options: [
//       {
//         name: "leaderboarid",
//         description: "Id of the Leaderboard that shall be deleted",
//         type: 3,
//         required: true,
//       },
//     ],
//   },
