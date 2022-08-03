import { CommandInteraction, Interaction } from "discord.js";
import { getLeaderboard } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { CommandNames } from "../command-names";

export async function cloneLeaderboardHandler(
  data: DataHolder
): Promise<HandlerResponse> {
  const model = new CloneLeaderboard(data);

  if (!model.isValid)
    throw new Error("You did not provide a valid leaderboardid.");

  const leaderboard = await getLeaderboard(model.leaderboardId);

  let postAction;
  if (model.allentries) {
    postAction = PostActionType.printLeaderboard;
  } else {
    postAction = PostActionType.printLeaderboardFiltered;
  }

  const postActions = [
    {
      action: postAction,
      data: leaderboard,
    },
  ];

  return {
    message: `Here you are!`,
    postActions,
  };
}

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
    return this.leaderboardId.match("^[0-9a-fA-F]{24}$");
  }
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
