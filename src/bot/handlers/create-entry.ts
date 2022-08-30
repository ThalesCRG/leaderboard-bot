import {
  ActionRowBuilder,
  ButtonInteraction,
  CacheType,
  ModalBuilder,
  ModalSubmitInteraction,
  SnowflakeUtil,
  TextInputBuilder,
  TextInputModalData,
  TextInputStyle,
  userMention,
} from "discord.js";
import { addEntry, isPersonAllowedById } from "../../database/database";
import {
  Command,
  DataHolder,
  DiscordDataTypes,
  HandlerResponse,
  PostActionType,
} from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { TIME_REGEX } from "../../utils/time-utils";
import { UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

type CreateEntryData = {
  leaderboardId: string;
  time: string;
  notes: string | null;
  clone: boolean | null;
};

export class CreateEntry extends BaseModel {
  leaderboardId: string;
  time: string;
  driver: string;
  notes: string | null;
  clone: boolean | null;
  constructor(data: DataHolder | CreateEntryData, user: string) {
    super();
    if (data.hasOwnProperty("leaderboardId")) {
      const createEntryData = data as CreateEntryData;
      this.leaderboardId = createEntryData.leaderboardId;
      this.time = createEntryData.time;
      this.driver = user;
      this.notes = createEntryData.notes;
      this.clone = false;
      return;
    }
    const dataHolder = data as DataHolder;
    this.leaderboardId = dataHolder.getString(
      CreateEntryOption.leaderboardId,
      true
    );
    this.time = dataHolder.getString(CreateEntryOption.time, true);
    this.driver = dataHolder.getUser(CreateEntryOption.driver)?.id ?? user;
    this.notes = dataHolder.getString(CreateEntryOption.notes);
    this.clone = dataHolder.getBoolean(CreateEntryOption.clone);
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

export const createEntryCommandHandler = async (
  data: DataHolder,
  user: string
): Promise<HandlerResponse> => {
  const model = new CreateEntry(data, user);

  if (!model.isValid) {
    console.error("create entry model is not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }

  return await createEntryHandler(model, user);
};

export const createEntryButtonprefix = "addEntryButton";

enum CreateEntryModalOptions {
  setTime = "setTime",
  setNote = "setNote",
}

export const createEntryModalPrefix = "addEntryModal";

async function createEntryHandler(model: CreateEntry, user: string) {
  const [id, leaderboard] = await addEntry(model, user);

  let postActions = [];
  if (model.clone) {
    postActions = [
      {
        action: PostActionType.printLeaderboardFiltered,
        data: { leaderboard },
      },
      {
        action: PostActionType.updateLeaderboards,
        data: { leaderboard },
      },
    ];
  } else {
    postActions = [
      {
        action: PostActionType.updateLeaderboards,
        data: { leaderboard },
      },
    ];
  }

  return {
    message: `Added entry for ${userMention(model.driver)} to leaderboard: ${
      leaderboard.name
    }`,
    postActions,
  };
}

export async function createEntryButtonHandler(
  buttonInteraction: ButtonInteraction
): Promise<HandlerResponse | undefined> {
  const leaderboardId = buttonInteraction.customId.split("-")[1];
  const userId = buttonInteraction.user.id;
  const isAllowed = await isPersonAllowedById(leaderboardId, userId);
  if (!isAllowed) {
    return {
      message: "You are not allowed to create a new Entry to this leaderboard.",
    };
  }

  const addEntryModal = new ModalBuilder()
    .setCustomId(`addEntryModal-${leaderboardId}-${SnowflakeUtil.generate()}`)
    .setTitle("Add Entry to Leaderboard")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(`${CreateEntryModalOptions.setTime}`)
          .setLabel("Time to add")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    )
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(`${CreateEntryModalOptions.setNote}`)
          .setLabel("Notes")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );

  buttonInteraction.showModal(addEntryModal);
}

export async function createEntryModalSubmitHandler(
  modalSubmitInteraction: ModalSubmitInteraction
) {
  const parsedData: CreateEntryData = parseModalSubmitData(
    modalSubmitInteraction
  );

  const userId = modalSubmitInteraction.user.id;

  const model = new CreateEntry(parsedData, userId);

  if (!model.isValid) {
    console.error("create entry model is not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }

  return await createEntryHandler(model, userId);
}

enum CreateEntryOption {
  leaderboardId = "leaderboardid",
  time = "time",
  driver = "driver",
  notes = "notes",
  clone = "clone",
}

export const createEntryCommand: Command = {
  name: CommandNames.createEntry,
  description: "Add an entry to the leaderboard",
  options: [
    {
      name: CreateEntryOption.leaderboardId,
      description: "Id of the Leaderboard to which the entry shall be added",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: CreateEntryOption.time,
      description: "Time in format MM:SS.mmm",
      type: DiscordDataTypes.STRING,
      required: true,
    },
    {
      name: CreateEntryOption.driver,
      description: "Driver name, defaults to requesting user",
      type: DiscordDataTypes.USER,
      required: false,
    },
    {
      name: CreateEntryOption.notes,
      description: "Want to add a note? e.g. car, conditions, ...",
      type: DiscordDataTypes.STRING,
      required: false,
    },
    {
      name: CreateEntryOption.clone,
      description: "Do you want to clone the leaderboard into a new message?",
      type: DiscordDataTypes.BOOLEAN,
      required: false,
    },
  ],
};

function parseModalSubmitData(
  modalSubmitInteraction: ModalSubmitInteraction<CacheType>
): CreateEntryData {
  const components = modalSubmitInteraction.components
    .map((comp) => comp.components as TextInputModalData[])
    .flat();

  const leaderboardId = modalSubmitInteraction.customId.split("-")[1] as string;

  const notes = components.find(
    (comp) => comp.customId === CreateEntryModalOptions.setNote
  )?.value as string;

  const time = components.find(
    (comp) => comp.customId === CreateEntryModalOptions.setTime
  )?.value as string;

  const data: CreateEntryData = {
    leaderboardId,
    time,
    notes,
    clone: false,
  };
  return data;
}
