import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { setLeaderboardDescription } from "../../database/database";
import { CommandNames } from "../command-names";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { MAX_DESCRIPTION_LENGTH } from "../../utils/messageUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

export class SetDescription extends BaseModel {
  leaderboardId: string;
  description: string;

  constructor(data: DataHolder) {
    super();
    this.leaderboardId = data.getString(
      SetDescriptionOption.leaderboardId,
      true
    );
    this.description = data.getString(SetDescriptionOption.description, true);
  }

  validate() {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
    this.check(
      () =>
        this.description.length > 0 &&
        this.description.length < MAX_DESCRIPTION_LENGTH,
      UserInputErrors.DescriptionError
    );
  }
}

export async function setDescriptionHandler(
  data: DataHolder,
  user: string
): Promise<HandlerResponse> {
  const model = new SetDescription(data);
  if (!model.isValid) {
    console.error("set desription model not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }

  const result = await setLeaderboardDescription(model, user);
  const shortDescription =
    result.description?.substring(0, 200) +
    (result.description?.length > 200 ? "..." : ""); //replys have a limit of 2000 Characters where embed descriptions have 4096

  return {
    message: `Leaderboard ${result.id} has now following description: \`${shortDescription}\``,
  };
}

enum SetDescriptionOption {
  leaderboardId = "leaderboardid",
  description = "description",
}

export const setDescriptionCommand: Command = {
  name: CommandNames.setDescription,
  description: "Changes,the description of the leaderboard",
  options: [
    {
      name: SetDescriptionOption.leaderboardId,
      description:
        "What is the ID of the Leaderboard which description you want to change",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: SetDescriptionOption.description,
      description: "What is the new description?",
      type: DiscordDataTypes.STRING,
      required: true,
    },
  ],
};
