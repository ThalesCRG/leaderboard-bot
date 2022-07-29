import { CommandInteraction, Interaction } from "discord.js";
import { addAllowence } from "../../database/database";

export default async function (interaction: Interaction): Promise<string> {
  if (!interaction) return "There was an error. Please try again";
  const command = interaction as CommandInteraction;

  const user = command.options.getUser("user");
  if (!user) {
    return "There was an error. Please try again";
  }

  const leaderboard = command.options.getString("leaderboardid");
  if (!leaderboard) return "There was an error. Please try again";

  const executor = command.user.id;

  await addAllowence(leaderboard, user.id, executor);

  return `Added <@${user.id}> to Leaderboard ${leaderboard}`;
}

// {
//   name: "addallowence",
//   description: "You can add other people to be able to add entries!",
//   options: [
//     {
//       name: "leaderboardid",
//       description: "To what leaderboard shall the user be added?",
//       type: 3,
//       required: true,
//     },
//     {
//       name: "user",
//       description: "Who shall be able to interact with your leaderboard?",
//       required: false,
//       type: 6,
//     },
//   ],
// }
