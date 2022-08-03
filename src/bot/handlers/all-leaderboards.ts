import { getAllLeaderboardsOfGuild } from "../../database/database";
import {
  Command,
  DataHolder,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { CommandNames } from "../command-names";

export class AllLeaderboards {}

export async function allLeaderboardsHandler(
  data: DataHolder,
  user: string,
  guildId: string
): Promise<HandlerResponse> {
  const leaderboards = await getAllLeaderboardsOfGuild(guildId);

  if (leaderboards.length === 0)
    return { message: "There are no Leaderboards here" };

  return {
    message: "Here you are!",
    postActions: [
      {
        action: PostActionType.printLeaderboardFiltered,
        data: { leaderboards },
      },
    ],
  };
}

export const allLeaderboardsCommand: Command = {
  name: CommandNames.allLeaderboards,
  description:
    "posts all leaderboards that were created on this discord server",
};
