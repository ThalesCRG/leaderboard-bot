import { getUserLeaderboards } from "../../database/database";
import { DataHolder, HandlerResponse, PostActionType } from "../../types";
import { getDMChannelToUser } from "../bot";
import { CommandNames } from "../command-names";

export async function myleaderboardsHandler(
  data: DataHolder,
  userId: string
): Promise<HandlerResponse> {
  const channel = await getDMChannelToUser(userId);

  if (channel === null) {
    console.error(`could not oepn a DM channel with user ${userId}`);
    throw new Error(
      "An error occurred: Could not reach you via DM. You may try again..."
    );
  }

  const leaderboards = await getUserLeaderboards(userId);

  return {
    message: "Hang on! I'll send you a DM!",
    postActions: [
      {
        action: PostActionType.printMultipleFilteredLeaderboards,
        data: { leaderboards, channel },
      },
    ],
  };
}

export const myLeaderboardsCommand = {
  name: CommandNames.myLeaderboards,
  description: "DMs you all leaderboards where you are a entry.",
};
