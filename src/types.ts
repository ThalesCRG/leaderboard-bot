import {
  CacheType,
  CommandInteractionOptionResolver,
  MessagePayload,
  WebhookEditMessageOptions,
} from "discord.js";

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

export type HandlerResponseMessage =
  | string
  | MessagePayload
  | WebhookEditMessageOptions;

export type HandlerResponse = {
  message: HandlerResponseMessage;
  postActions?: PostAction[];
};

export enum PostActionType {
  printLeaderboardFiltered,
}

export type PostAction = {
  action: PostActionType;
  data: any;
};

export enum DiscordDataTypes {
  "STRING" = 3,
  "NUMBER" = 4,
  "BOOLEAN" = 5,
}
