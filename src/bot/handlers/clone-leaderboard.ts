import { getLeaderboard } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";

export class CloneLeaderboard {
  leaderboardId: string;
  allentries: boolean;
  constructor(data: DataHolder) {
    this.leaderboardId = data.getString(
      cloneLeaderboardOption.leaderboardId,
      true
    );
    this.allentries =
      data.getBoolean(cloneLeaderboardOption.allentries) || false;
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

export async function cloneLeaderboardHandler(
  data: DataHolder
): Promise<HandlerResponse> {
  const model = new CloneLeaderboard(data);

  if (!model.isValid) {
    console.error("clone leaderboar model is not valid", JSON.stringify(model));
    const errorMesssage = model.errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    throw new Error(errorMesssage);
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
