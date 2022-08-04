import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { setProtected } from "../../database/database";
import { CommandNames } from "../command-names";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

export class SetProtected extends BaseModel {
  leaderboardId: string;
  protectedFlag: boolean;

  constructor(data: DataHolder) {
    super();
    this.leaderboardId = data.getString("leaderboardid", true);
    this.protectedFlag = data.getBoolean("protected", true);
  }

  validate() {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
  }
}

export async function setProtectedHandler(
  data: DataHolder,
  user: string
): Promise<HandlerResponse> {
  const model = new SetProtected(data);
  if (!model.isValid) {
    console.error("set protected model not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }

  await setProtected(model, user);

  return {
    message: `Leaderboard ${model.leaderboardId} is now ${
      model.protectedFlag ? "protected" : "not protected"
    }`,
  };
}

enum SetProtectedOption {
  leaderboardId = "leaderboardid",
  protectedFlag = "protected",
}

export const setProtectedCommand: Command = {
  name: CommandNames.setProtected,
  description: "Changes, wether or not your leaderboard is protected",
  options: [
    {
      name: SetProtectedOption.leaderboardId,
      description:
        "The ID of the leaderboard that protection should be changed",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: SetProtectedOption.protectedFlag,
      description:
        "Should only you be allowed to create entries on this leaderboard?",
      type: DiscordDataTypes.BOOLEAN,
      required: true,
    },
  ],
};
