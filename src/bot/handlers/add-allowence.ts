import { addAllowence } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";

export class AddAllowence extends BaseModel {
  leaderboardId: string;
  userId: string;
  executorId: string;
  constructor(data: DataHolder, executorId: string) {
    super();
    this.leaderboardId = data.getString(AddAllowenceOption.leaderboardId, true);
    this.userId = data.getUser(AddAllowenceOption.user, true).id;
    this.executorId = executorId;
  }

  validate(): void {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
    this.check(() => this.userId.length > 0, UserInputErrors.UserError);
  }
}

export const addallowenceHandler = async (
  data: DataHolder,
  user: string
): Promise<HandlerResponse> => {
  const model = new AddAllowence(data, user);

  if (!model.isValid) {
    console.error("Add allowance model is not valid", JSON.stringify(model));
    const errorMesssage = model.errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    throw new Error(errorMesssage);
  }

  const newAllowence = await addAllowence(model, user);

  if (newAllowence) {
    return {
      message: `Added <@${newAllowence?.userId}> to Leaderboard ${newAllowence?.leaderboardId}`,
    };
  } else {
    return {
      message: "There was an Error in the Database. Please try again later.",
    };
  }
};

enum AddAllowenceOption {
  leaderboardId = "leaderboardid",
  user = "user",
}

export const addallowenceCommand: Command = {
  name: CommandNames.addAllowence,
  description: "You can add other people to be able to add entries!",
  options: [
    {
      name: AddAllowenceOption.leaderboardId,
      description: "To what leaderboard shall the user be added?",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: AddAllowenceOption.user,
      description: "Who shall be able to interact with your leaderboard?",
      type: DiscordDataTypes.USER,
      required: true,
    },
  ],
};
