import { CommandInteraction, Interaction } from "discord.js";
import { removeAllowence } from "../../database/database";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  const command = interaction as CommandInteraction;

  const user = command.options.getUser("user");
  if (!user) {
    throw new Error("User not provided.");
  }

  const leaderboard = command.options.getString("leaderboardid");
  if (!leaderboard) throw new Error("Leaderboard Id not provided.");

  const executor = command.user.id;

  await removeAllowence(leaderboard, user.id, executor);
  try {
    if (command.isRepliable())
      await command.reply({
        content: `Removed <@${user.id}> from Leaderboard ${leaderboard}`,
        ephemeral: true,
      });
  } catch (error) {
    console.log(error);
  }
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
