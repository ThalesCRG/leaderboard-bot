import { getLeaderboard } from "../../database/database";
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

export class CloneLeaderboard extends BaseModel {
  leaderboardId: string;
  allentries: boolean;
  constructor(data: DataHolder) {
    super();
    this.leaderboardId = data.getString(
      cloneLeaderboardOption.leaderboardId,
      true
    );
    this.allentries =
      data.getBoolean(cloneLeaderboardOption.allentries) || false;
  }

  validate(): void {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
  }
}

export async function cloneLeaderboardHandler(
  data: DataHolder
): Promise<HandlerResponse> {
  const model = new CloneLeaderboard(data);

  if (!model.isValid) {
    console.error("clone leaderboar model is not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }
  const leaderboard = await getLeaderboard(model.leaderboardId);

  const postActions = [
    {
      action: model.allentries
        ? PostActionType.printLeaderboard
        : PostActionType.printLeaderboardFiltered,
      data: { leaderboard },
    },
  ];

  return {
    message: `Here you are!`,
    postActions,
  };
}

const cloneLeaderboardOption = {
  leaderboardId: "leaderboardid",
  allentries: "allentries",
};

export const cloneLeaderboardCommand: Command = {
  name: CommandNames.cloneLeaderboard,
  description: "Creates a Leaderboardmessage for your Channel",
  options: [
    {
      name: cloneLeaderboardOption.leaderboardId,
      description: "The ID of the leaderboard that shall be cloned",
      required: true,
      type: DiscordDataTypes.STRING,
    },
    {
      name: cloneLeaderboardOption.allentries,
      description:
        "Do you want to see all entries instead of the best per Driver?",
      required: false,
      type: DiscordDataTypes.BOOLEAN,
    },
  ],
};
