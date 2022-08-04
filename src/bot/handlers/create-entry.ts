import { addEntry } from "../../database/database";
import {
  Command,
  DataHolder,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { TIME_REGEX } from "../../utils/time-utils";
import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";

export class CreateEntry extends BaseModel {
  leaderboardId: string;
  time: string;
  driver: string;
  notes: string | null;
  constructor(data: DataHolder, user: string) {
    super();
    this.leaderboardId = data.getString(CreateEntryOption.leaderboardId, true);
    this.time = data.getString(CreateEntryOption.time, true);
    this.driver = data.getUser(CreateEntryOption.driver)?.id ?? user;
    this.notes = data.getString(CreateEntryOption.notes);
  }

  validate() {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
    this.check(
      () => this.time.match(TIME_REGEX),
      UserInputErrors.TimeParseError
    );
    this.check(() => this.driver.length, UserInputErrors.UserError);
  }
}

export const createEntryHandler = async (
  data: DataHolder,
  user: string
): Promise<HandlerResponse> => {
  const model = new CreateEntry(data, user);

  if (!model.isValid) {
    console.error("create entry model is not valid", JSON.stringify(model));
    const errorMesssage = model.errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    throw new Error(errorMesssage);
  }

  const [id, leaderboard] = await addEntry(model, user);

  const postActions = [
    {
      action: PostActionType.printLeaderboardFiltered,
      data: { leaderboard },
    },
  ];

  return {
    message: `Added entry ${id} for <@${model.driver}> to leaderboard: ${leaderboard.name}`,
    postActions,
  };
};

enum CreateEntryOption {
  leaderboardId = "leaderboardid",
  time = "time",
  driver = "driver",
  notes = "notes",
}

export const createEntryCommand: Command = {
  name: CommandNames.createEntry,
  description: "Add an entry to the leaderboard",
  options: [
    {
      name: CreateEntryOption.leaderboardId,
      description: "Id of the Leaderboard to which the entry shall be added",
      type: 3,
      required: true,
    },
    {
      name: CreateEntryOption.time,
      description: "Time in format MM:SS.mmm",
      type: 3,
      required: true,
    },
    {
      name: CreateEntryOption.driver,
      description: "Driver name, defaults to requesting user",
      type: 6,
      required: false,
    },
    {
      name: CreateEntryOption.notes,
      description: "Want to add a note? e.g. car, conditions, ...",
      type: 3,
      required: false,
    },
  ],
};
