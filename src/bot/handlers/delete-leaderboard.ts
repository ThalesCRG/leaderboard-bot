import { deleteLeaderboard } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";

export class DeleteLeaderboard {
  leaderboardId: string;
  constructor(data: DataHolder) {
    this.leaderboardId = data.getString(
      DeleteLeaderboardOption.leaderboardid,
      true
    );
  }
  get isValid() {
    return this.errors.length === 0;
  }

  get errors() {
    let errors: UserInputErrors[] = [];
    if (!this.leaderboardId.match(LEADERBOARDID_REGEX)) {
      errors.push(UserInputErrors.LeaderboardIdError);
    }
    return errors;
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

    const errorMesssage = model.errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    throw new Error(errorMesssage);
  }

  const result = await deleteLeaderboard(model, executorId);
  if (!result)
    throw new Error(
      "Sorry, there was an error in the database. Please try again later."
    );
  return { message: `Deleted Leaderboard ${result.leaderboardId}` };
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
