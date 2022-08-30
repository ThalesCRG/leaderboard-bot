import { inlineCode } from "discord.js";
import * as database from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

export class UpdateLeaderboard extends BaseModel {
  leaderboardId: string;
  constructor(data: DataHolder) {
    super();
    this.leaderboardId = data.getString(
      UpdateLeaderboardOption.leaderboardId,
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

export const updateLeaderboardHandler = async (
  data: DataHolder,
  user: string,
  guild: string
): Promise<HandlerResponse> => {
  const model = new UpdateLeaderboard(data);

  if (!model.isValid) {
    console.error(
      "update leaderboard model is not valid",
      JSON.stringify(model)
    );
    throw new ValidationError(model.errors);
  }

  const leaderboard = await database.getLeaderboard(model.leaderboardId);
  if (!leaderboard)
    throw new Error(`Leaderboard ${model.leaderboardId} not found.`);
  return {
    message: `Messeges for Leaderboard with ID: ${inlineCode(
      leaderboard.id as string
    )} updated.`,
    postActions: [
      {
        action: PostActionType.updateLeaderboards,
        data: { leaderboard },
      },
    ],
  };
};

enum UpdateLeaderboardOption {
  leaderboardId = "leaderboardid",
}

export const updateLeaderboardCommand: Command = {
  name: CommandNames.updateLeaderboard,
  description: "Updates leaderboard messages for a given Leaderboard.",
  options: [
    {
      name: UpdateLeaderboardOption.leaderboardId,
      description: "Id of the Leaderboard of the leaderboard",
      type: DiscordDataTypes.STRING,
      required: true,
    },
  ],
};
