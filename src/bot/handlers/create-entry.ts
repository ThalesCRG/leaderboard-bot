import { addEntry } from "../../database/database";
import {
  Command,
  DataHolder,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { TIME_REGEX } from "../../utils/time-utils";
import { CommandNames } from "../command-names";

export class CreateEntry {
  leaderboardId: string;
  time: string;
  driver: string;
  notes: string | null;
  constructor(data: DataHolder, user: string) {
    this.leaderboardId = data.getString(CreateEntryOption.leaderboardId, true);
    this.time = data.getString(CreateEntryOption.time, true);
    this.driver = data.getUser(CreateEntryOption.driver)?.id ?? user;
    this.notes = data.getString(CreateEntryOption.notes);
  }
  get isValid() {
    return (
      this.leaderboardId.match("^[0-9a-fA-F]{24}$") &&
      TIME_REGEX.test(this.time) &&
      this.driver?.length
    );
  }
}

export const createEntryHandler = async (
  data: DataHolder,
  user: string
): Promise<HandlerResponse> => {
  const model = new CreateEntry(data, user);

  if (!model.isValid) {
    console.error("create entry model is not valid", JSON.stringify(model));
    throw new Error("create entry model is not valid");
  }

  const [id, leaderboard] = await addEntry(model, user);

  const postActions = [
    {
      action: PostActionType.printLeaderboardFiltered,
      data: leaderboard,
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
