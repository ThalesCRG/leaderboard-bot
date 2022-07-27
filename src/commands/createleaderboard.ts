import { CommandInteraction, Interaction } from "discord.js";
import { createleaderboard } from "../utils/dataUtils";
import { printLeaderboard } from "../utils/messageUtils";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  const command = interaction as CommandInteraction;
  const leaderboardName = command.options.getString("leaderboardname");
  const description = command.options.getString("description");
  const protectedFlag = command.options.getBoolean("protected") || false;
  
  if (!leaderboardName || !description || !command.guildId) return;

  const leaderboard = await createleaderboard(
    leaderboardName,
    description,
    command.user.id,
    command.guildId,
    protectedFlag
  );

  if (!command.channel || !leaderboard) return;
  printLeaderboard(leaderboard, command.channel);
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
