import { CommandInteraction, Interaction } from "discord.js";
import { deleteLeaderboard } from "../../database/database";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  const command = interaction as CommandInteraction;

  const user = command.user.id;
  if (!user) return;

  const leaderboardId = command.options.getString("leaderboardid");
  if (!leaderboardId) throw new Error("LeaderboardID not provided");

  try {
    await deleteLeaderboard(leaderboardId, user);
  } catch (error) {
    console.log(error);
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
