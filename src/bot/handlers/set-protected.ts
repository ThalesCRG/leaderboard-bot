import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
} from "../../types";
import { setProtected } from "../../database/database";
import { CommandNames } from "../command-names";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";

export class SetProtected {
  leaderboardId: string;
  protectedFlag: boolean;

  constructor(data: DataHolder, user: string) {
    this.leaderboardId = data.getString("leaderboardid", true);
    this.protectedFlag = data.getBoolean("protected", true);
  }

  get isValid() {
    return this.leaderboardId.match(LEADERBOARDID_REGEX);
  }
}

export async function setProtectedHandler(
  data: DataHolder,
  user: string
): Promise<HandlerResponse> {
  const model = new SetProtected(data, user);
  if (!model.isValid) {
    console.error("set protected model not valid", JSON.stringify(model));
    throw new Error("set protected model not valid");
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
