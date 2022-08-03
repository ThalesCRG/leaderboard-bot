import { UserManager } from "discord.js";
import { getUserLeaderboards } from "../../database/database";
import { DataHolder, HandlerResponse, PostActionType } from "../../types";
import { printFilteredLeaderboard } from "../../utils/messageUtils";
import { client } from "../bot";
import { CommandNames } from "../command-names";

export async function myleaderboardsHandler(
  data: DataHolder,
  userId: string
): Promise<HandlerResponse> {
  const user = await client.users.fetch(userId);
  const channel = await user.createDM(true);
  if (!channel) throw new Error("Could not resolve channel");

  const leaderboards = await getUserLeaderboards(userId);

  return {
    message: "I send you a DM!",
    postActions: [
      {
        action: PostActionType.printLeaderboardFiltered,
        data: { leaderboards, channel },
      },
    ],
  };
}

export const myLeaderboardsCommand = {
  name: CommandNames.myLeaderboards,
  description: "DMs you all leaderboards where you are a entry.",
};
