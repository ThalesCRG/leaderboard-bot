import { CommandInteraction, Interaction } from "discord.js";
import { deleteLeaderboard } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { CommandNames } from "../command-names";

export class DeleteLeaderboard {
  leaderboardId: string;
  constructor(data: DataHolder) {
    this.leaderboardId = data.getString(
      deleteLeaderboardOption.leaderboardid,
      true
    );
  }
  get isValid() {
    return this.leaderboardId.match(LEADERBOARDID_REGEX);
  }
}

export async function deleteLeaderboardHandler(
  data: DataHolder,
  executorId: string
): Promise<HandlerResponse> {
  const model = new DeleteLeaderboard(data);

  if (!model.isValid) {
    throw new Error("Leaderboard Id is not a valid Id");
  }

  const result = await deleteLeaderboard(model, executorId);
  if (!result)
    throw new Error(
      "Sorry, there was an error in the database. Please try again later."
    );
  return { message: `Deleted Leaderboard ${result.leaderboardId}` };
}

enum deleteLeaderboardOption {
  leaderboardid = "leaderboardid",
}

export const deleteLeaderboardCommand: Command = {
  name: CommandNames.deleteLeaderboard,
  description: "Deletes a Leaderboard",
  options: [
    {
      name: deleteLeaderboardOption.leaderboardid,
      description: "Id of the Leaderboard that shall be deleted",
      type: DiscordDataTypes.STRING,
      required: true,
    },
  ],
};
