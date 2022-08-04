import { removeAllowence } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
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
    return this.userId.length > 0;
  }

  get errors() {
    let errors: UserInputErrors[] = [];
    if (!this.leaderboardId.match(LEADERBOARDID_REGEX)) {
      errors.push(UserInputErrors.LeaderboardIdError);
    }
    if (this.userId.length <= 0) {
      errors.push(UserInputErrors.UserError);
    }
    return errors;
  }
}

export async function removeAllowenceHandler(
  data: DataHolder,
  executorId: string
): Promise<HandlerResponse> {
  const model = new RemoveAllowence(data);

  if (!model.isValid) {
    console.error("remove allowence model is not valid", JSON.stringify(model));

    const errorMesssage = model.errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    throw new Error(errorMesssage);
  }

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
