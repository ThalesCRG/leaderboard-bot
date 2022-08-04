import * as database from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { LEADERBOARD_NAME_MAX_LENGTH } from "../../utils/LeaderboardUtils";
import { MAX_DESCRIPTION_LENGTH } from "../../utils/messageUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";

export class CreateLeaderboard {
  name: string;
  description: string;
  protected: boolean;
  constructor(data: DataHolder) {
    this.name = data.getString(CreateLeaderboardOption.name, true);
    this.description = data.getString(
      CreateLeaderboardOption.description,
      true
    );
    this.protected =
      data.getBoolean(CreateLeaderboardOption.protected) || false;
  }

  get isValid() {
    return this.errors.length === 0;
  }

  get errors() {
    let errors: UserInputErrors[] = [];
    if (
      this.name.length <= 0 ||
      this.name.length > LEADERBOARD_NAME_MAX_LENGTH
    ) {
      errors.push(UserInputErrors.LeaderboardTitleError);
    }
    if (
      this.description.length <= 0 ||
      this.description.length > MAX_DESCRIPTION_LENGTH
    ) {
      errors.push(UserInputErrors.DescriptionError);
    }
    return errors;
  }
}

export const createLeaderboardHandler = async (
  data: DataHolder,
  user: string,
  guild: string
): Promise<HandlerResponse> => {
  const model = new CreateLeaderboard(data);

  if (!model.isValid) {
    console.error(
      "create leaderboard model is not valid",
      JSON.stringify(model)
    );

    const errorMesssage = model.errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    throw new Error(errorMesssage);
  }

  const id = await database.saveLeaderboard(model, user, guild);

  return { message: `Leaderboard with ${id} created.` };
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
