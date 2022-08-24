import {
  CacheType,
  CommandInteractionOptionResolver,
  MessagePayload,
  MessageOptions,
  TextBasedChannel,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { ILeaderboardEntity } from "./database/database-types";

export type CommandLike =
  | Command
  | RESTPostAPIChatInputApplicationCommandsJSONBody;

export interface Command {
  name: string;
  description: string;
  options?: Options[];
  guildId?: string;
  default_member_permissions?: string;
  dm_permission?: boolean;
}
export interface Options {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: Choices[];
}
export interface Choices {
  name: string;
  type: number;
  value?: string | number;
}

export type DataHolder = Omit<
  CommandInteractionOptionResolver<CacheType>,
  "getMessage" | "getFocused"
>;

export type HandlerResponseMessage = string | MessagePayload | MessageOptions;

export type HandlerResponse = {
  message: HandlerResponseMessage;
  postActions?: PostAction[];
};

export enum PostActionType {
  printLeaderboard,
  printLeaderboardFiltered,
  printMultipleLeaderboards,
  printMultipleFilteredLeaderboards,
  updateLeaderboards,
}

export type PostAction = {
  action: PostActionType;
  data: {
    leaderboards?: ILeaderboardEntity[];
    leaderboard?: ILeaderboardEntity;
    channel?: TextBasedChannel;
  };
};

export enum DiscordDataTypes {
  "SUB_COMMAND" = 1,
  "SUB_COMMAND_GROUP" = 2,
  "STRING" = 3,
  "INTEGER" = 4,
  "BOOLEAN" = 5,
  "USER" = 6,
  "CHANNEL" = 7,
  "ROLE" = 8,
  "MENTIONABLE" = 9,
  "NUMBER" = 10,
  "ATTACHMENT" = 11,
}
