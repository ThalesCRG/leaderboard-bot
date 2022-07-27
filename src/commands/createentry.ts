import { CommandInteraction, Interaction } from "discord.js";
import { addEntry, getLeaderboard } from "../utils/dataUtils";
import {
  printFilteredLeaderboard,
  printLeaderboard,
} from "../utils/messageUtils";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  const command = interaction as CommandInteraction;

  const leaderboardId = command.options.getString("leaderboardid");
  const time = command.options.getString("time");
  if (!leaderboardId || !time) return;

  let driver = command.options.getUser("driver");
  if (!driver) driver = command.user;
  if (!driver && !command.user) return;

  const executor = command.user.id;
  const notes = command.options.getString("notes");
  if (notes)
    await addEntry(driver.id, parseTime(time), leaderboardId, executor, notes);
  else await addEntry(driver.id, parseTime(time), leaderboardId, executor);

  const leaderboard = await getLeaderboard(leaderboardId);

  if (!command.channel || !leaderboard) return;
  console.log(`${leaderboard.entries}`);

  printFilteredLeaderboard(leaderboard, command.channel);
}

function parseTime(time: string): number {
  let result = 0;
  const splitByDoublePoints = time.split(":");
  let minutes = splitByDoublePoints[0];
  let splitByPoint = splitByDoublePoints[1].split(".");
  let seconds = splitByPoint[0];
  let millisecond = splitByPoint[1];

  result += Number.parseInt(minutes) * 60 * 1000;
  result += Number.parseInt(seconds) * 1000;
  result += Number.parseInt(millisecond);
  return result;
}
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
//       {
//         name: "notes",
//         description: "Any Notes to add? e.g. Car, or conditons",
//         type: 3,
//         required: false,
//       },
//     ],
//   },
