import { CommandInteraction, Interaction } from "discord.js";
import { createleaderboard } from "../../database/database";
import { printLeaderboard } from "../../utils/messageUtils";

export default async function (interaction: Interaction): Promise<string> {
  if (!interaction) return "There was an error. Please try again";
  const command = interaction as CommandInteraction;
  const leaderboardName = command.options.getString("leaderboardname");
  const description = command.options.getString("description");
  const protectedFlag = command.options.getBoolean("protected") || false;

  if (!leaderboardName || !description || !command.guildId)
    return "There was an error. Please try again";

  const leaderboard = await createleaderboard(
    leaderboardName,
    description,
    command.user.id,
    command.guildId,
    protectedFlag
  );

  if (!command.channel || !leaderboard)
    return "There was an error. Please try again";
  printLeaderboard(leaderboard, command.channel);

  return `Leaderboard ${leaderboard.name} successfully created.`;
}

// {
//     name: "createleaderboard",
//     description: "Creates a Leaderboard and posts it in your Channel",
//     options: [
//       {
//         name: "leaderboardname",
//         description: "The name of the leaderboard",
//         type: 3,
//         required: true,
//       },
//       {
//         name: "description",
//         description: "Description of the leaderboard",
//         type: 3,
//         required: true,
//       },
//       {
//         name: "public",
//         description: "Can everybody submit a time?",
//         type: 5,
//         required: false,
//       },
//     ],
//   },
