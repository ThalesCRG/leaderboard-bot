import { Interaction } from "discord.js";

export default async function (interaction: Interaction) {}

//  {
//     name: "createentry",
//     description: "Add an entry to the leaderboard",
//     options: [
//       {
//         name: "leaderboarid",
//         description: "Id of the Leaderboard to which the entry shall be added",
//         type: 3,
//         required: true,
//       },
//       {
//         name: "time",
//         description: "Time in format MM:SS.mmm",
//         type: 3,
//         required: true,
//       },
//       {
//         name: "driver",
//         description: "Driver who drove this time defaults to yourself",
//         type: 6,
//         required: false,
//       },
//     ],
//   },