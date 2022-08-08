import {
  inlineCode,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  userMention,
} from "discord.js";
import { addAllowence, removeAllowence } from "../../database/database";
import { DataHolder, HandlerResponse } from "../../types";
import { LEADERBOARDID_REGEX } from "../../utils/LeaderboardUtils";
import { UserInputErrors } from "../../utils/UserInputUtils";
import { CommandNames } from "../command-names";
import { BaseModel } from "./base-model";
import { ValidationError } from "./validation-error";

export class Allowence extends BaseModel {
  leaderboardId: string;
  userId: string;
  executorId: string;
  subcommand: AllowenceSubcommand;
  constructor(data: DataHolder, executorId: string) {
    super();
    this.leaderboardId = data.getString(AllowenceOption.leaderboardId, true);
    this.userId = data.getUser(AllowenceOption.user, true).id;
    this.executorId = executorId;
    this.subcommand = data.getSubcommand(true) as AllowenceSubcommand;
  }

  validate(): void {
    this.check(
      () => this.leaderboardId.match(LEADERBOARDID_REGEX),
      UserInputErrors.LeaderboardIdError
    );
    this.check(() => this.userId.length > 0, UserInputErrors.UserError);
  }
}

export enum AllowenceSubcommand {
  add = "add",
  remove = "remove",
}

export async function allowenceHandler(
  data: DataHolder,
  executorId: string
): Promise<HandlerResponse> {
  const model = new Allowence(data, executorId);

  if (!model.isValid) {
    console.error("Allowance model is not valid", JSON.stringify(model));
    throw new ValidationError(model.errors);
  }

  switch (model.subcommand) {
    case AllowenceSubcommand.add:
      return await addallowenceHandler(model);
    case AllowenceSubcommand.remove:
      return await removeAllowenceHandler(model);
  }
}

export const addallowenceHandler = async (
  model: Allowence
): Promise<HandlerResponse> => {
  const newAllowence = await addAllowence(model, model.executorId);

  if (newAllowence) {
    return {
      message: `Added ${userMention(
        newAllowence?.userId
      )} to Leaderboard ${inlineCode(newAllowence?.leaderboardId)}`,
    };
  } else {
    return {
      message: "There was an Error in the Database. Please try again later.",
    };
  }
};

export async function removeAllowenceHandler(
  model: Allowence
): Promise<HandlerResponse> {
  const result = await removeAllowence(model, model.executorId);
  if (result)
    return {
      message: `Removed ${userMention(
        result.userId
      )} from Leaderboard ${inlineCode(result.leaderboardId)}`,
    };
  return { message: "There was an error in the Database." };
}

enum AllowenceOption {
  leaderboardId = "leaderboardid",
  user = "user",
}

const addAllowenceSubCommand = new SlashCommandSubcommandBuilder()
  .setName(AllowenceSubcommand.add)
  .setDescription("You can add other people to be able to add entries!")
  .addStringOption((leaderboardOption) =>
    leaderboardOption
      .setName(AllowenceOption.leaderboardId)
      .setDescription("To what leaderboard shall the user be added?")
      .setRequired(true)
  )
  .addUserOption((userOption) =>
    userOption
      .setName(AllowenceOption.user)
      .setDescription("Who shall be able to interact with your leaderboard?")
      .setRequired(true)
  );

const removeAllowenceSubCommand = new SlashCommandSubcommandBuilder()
  .setName(AllowenceSubcommand.remove)
  .setDescription("You can remove other people to be able to add entries!")
  .addStringOption((leaderboardOption) =>
    leaderboardOption
      .setName(AllowenceOption.leaderboardId)
      .setDescription("Who shall be able to interact with your leaderboard?")
      .setRequired(true)
  )
  .addUserOption((userOption) =>
    userOption
      .setName(AllowenceOption.user)
      .setDescription(
        "Who shall not be able to interact with your leaderboard anymore?"
      )
      .setRequired(true)
  );

const allowenceCommandBuilder = new SlashCommandBuilder()
  .setName(CommandNames.allowence)
  .setDescription("Manages the allowences to a protected leaderboard")
  .addSubcommand(addAllowenceSubCommand)
  .addSubcommand(removeAllowenceSubCommand);

export const allowenceCommand =
  allowenceCommandBuilder.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody;
