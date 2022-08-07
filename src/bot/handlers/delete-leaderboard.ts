import { deleteLeaderboard } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

export class DeleteLeaderboard extends BaseModel {
  leaderboardId: string;
  constructor(data: DataHolder) {
    super();
    this.leaderboardId = data.getString(
      DeleteLeaderboardOption.leaderboardid,
      true
    );
  }

  validate() {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
  }
}

export async function deleteLeaderboardHandler(
  data: DataHolder,
  executorId: string
): Promise<HandlerResponse> {
  const model = new DeleteLeaderboard(data);

  if (!model.isValid) {
    console.error(
      "delete leaderboard model is not valid",
      JSON.stringify(model)
    );
    throw new ValidationError(model.errors);
  }

  const result = await deleteLeaderboard(model, executorId);
  if (!result)
    throw new Error(
      "Sorry, there was an error in the database. Please try again later."
    );
  return { message: `Deleted Leaderboard \`${result.leaderboardId}\`` };
}

enum DeleteLeaderboardOption {
  leaderboardid = "leaderboardid",
}

export const deleteLeaderboardCommand: Command = {
  name: CommandNames.deleteLeaderboard,
  description: "Deletes a Leaderboard",
  options: [
    {
      name: DeleteLeaderboardOption.leaderboardid,
      description: "Id of the Leaderboard that shall be deleted",
      type: DiscordDataTypes.STRING,
      required: true,
    },
  ],
};
