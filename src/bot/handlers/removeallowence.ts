import { removeAllowence } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { CommandNames } from "../command-names";

export class RemoveAllowence {
  leaderboardId: string;
  userId: string;
  constructor(data: DataHolder) {
    this.leaderboardId = data.getString(
      RemoveAllowanceOption.leaderboardid,
      true
    );
    this.userId = data.getUser(RemoveAllowanceOption.user, true).id;
  }
  get isValid() {
    return (
      this.leaderboardId.match(LEADERBOARDID_REGEX) && this.userId.length > 0
    );
  }
}

export async function removeAllowenceHandler(
  data: DataHolder,
  executorId: string
): Promise<HandlerResponse> {
  const model = new RemoveAllowence(data);

  if (!model.isValid)
    throw new Error(
      "Invalid Parameters. Please check the the Leaderboard ID and/or the user."
    );

  const result = await removeAllowence(model, executorId);
  return {
    message: `Removed <@${result.userId}> from Leaderboard ${result.leaderboardId}`,
  };
}

enum RemoveAllowanceOption {
  leaderboardid = "leaderboardid",
  user = "user",
}

export const removeAllowenceCommand: Command = {
  name: CommandNames.removeAllowence,
  description: "You can remove other people to be able to add entries!",
  options: [
    {
      name: RemoveAllowanceOption.leaderboardid,
      description: "To what leaderboard shall the user be removed?",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: RemoveAllowanceOption.user,
      description:
        "Who shall not be able to interact with your leaderboard anymore?",
      type: DiscordDataTypes.USER,
      required: true,
    },
  ],
};
