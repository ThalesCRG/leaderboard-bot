import { removeAllowence } from "../../database/database";
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

export class RemoveAllowence extends BaseModel {
  leaderboardId: string;
  userId: string;
  constructor(data: DataHolder) {
    super();
    this.leaderboardId = data.getString(
      RemoveAllowanceOption.leaderboardid,
      true
    );
    this.userId = data.getUser(RemoveAllowanceOption.user, true).id;
  }

  validate() {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
    this.check(() => this.userId.length > 0, UserInputErrors.UserError);
  }
}

export async function removeAllowenceHandler(
  data: DataHolder,
  executorId: string
): Promise<HandlerResponse> {
  const model = new RemoveAllowence(data);

  if (!model.isValid) {
    console.error("remove allowence model is not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }

  const result = await removeAllowence(model, executorId);
  if (result)
    return {
      message: `Removed <@${result.userId}> from Leaderboard \`${result.leaderboardId}\``,
    };
  return { message: "There was an error in the Database." };
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
