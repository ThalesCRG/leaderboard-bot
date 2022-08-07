import * as database from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARD_NAME_MAX_LENGTH } from "../../utils/LeaderboardUtils";
import { MAX_DESCRIPTION_LENGTH } from "../../utils/messageUtils";
import { UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

export class CreateLeaderboard extends BaseModel {
  name: string;
  description: string;
  protected: boolean;
  constructor(data: DataHolder) {
    super();
    this.name = data.getString(CreateLeaderboardOption.name, true);
    this.description = data.getString(
      CreateLeaderboardOption.description,
      true
    );
    this.protected =
      data.getBoolean(CreateLeaderboardOption.protected) || false;
  }

  validate() {
    this.check(
      () =>
        this.name.length > 0 && this.name.length < LEADERBOARD_NAME_MAX_LENGTH,
      UserInputErrors.LeaderboardTitleError
    );

    this.check(
      () =>
        this.description.length > 0 &&
        this.description.length < MAX_DESCRIPTION_LENGTH,
      UserInputErrors.DescriptionError
    );
  }
}

export const createLeaderboardHandler = async (
  data: DataHolder,
  user: string,
  guild: string
): Promise<HandlerResponse> => {
  const model = new CreateLeaderboard(data);

  console.log("valid", model.isValid);
  if (!model.isValid) {
    console.error(
      "create leaderboard model is not valid",
      JSON.stringify(model)
    );
    throw new ValidationError(model.errors);
  }

  const id = await database.saveLeaderboard(model, user, guild);

  return { message: `Leaderboard with ID: \`${id}\` created.` };
};

enum CreateLeaderboardOption {
  name = "leaderboardname",
  description = "description",
  protected = "protected",
}

export const createLeaderboardCommand: Command = {
  name: CommandNames.createLeaderboard,
  description: "Creates a Leaderboard and posts it in your Channel",
  options: [
    {
      name: CreateLeaderboardOption.name,
      description: "The name of the leaderboard",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: CreateLeaderboardOption.description,
      description: "Description of the leaderboard",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: CreateLeaderboardOption.protected,
      description: "Can everybody submit a time?",
      type: DiscordDataTypes.BOOLEAN,
      required: false,
    },
  ],
};
