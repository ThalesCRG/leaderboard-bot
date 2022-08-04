import {
  CacheType,
  Client,
  CommandInteraction,
  DMChannel,
  Intents,
  Interaction,
  TextBasedChannel,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";

import handlers, { commands } from "./handlers";
import {
  Command,
  HandlerResponse,
  HandlerResponseMessage,
  PostAction,
  PostActionType,
} from "../types";
import {
  printFilteredLeaderboard,
  printLeaderboard,
  printMultipleFilteredLeaderboards,
  printMultipleLeaderboards,
} from "../utils/messageUtils";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

export async function initConnection(token: string, appId: string) {
  console.log("trying bot login...");
  await client.login(token);
  console.log("bot login successful");

  const rest = new REST({ version: "9" }).setToken(token);

  const remoteCommands = await rest.get(Routes.applicationCommands(appId));

  const commandsUpToDate = compareCommandLists(
    commands,
    remoteCommands as Command[]
  );

  if (commandsUpToDate === false) {
    console.log("Started refreshing application (/) commands.");

    const response = (await rest.put(Routes.applicationCommands(appId), {
      body: commands,
    })) as Array<{ id: string; name: string }>;

    const updatedCommands = response.map((cmd) => {
      return { id: cmd.id, name: cmd.name };
    });
    console.log("updated commands", updatedCommands);
  } else {
    console.log("all commands up to date");
  }

  client.on("interactionCreate", handleInteractions);
}

const handleInteractions = async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    await interaction.reply({ content: "wait a second", ephemeral: true });

    let response: HandlerResponse = { message: "no response retrieved" };

    try {
      response = await handlers[interaction.commandName](
        interaction.options,
        interaction.user?.id,
        interaction.guildId
      );

      console.log(
        `handler for ${interaction.commandName} returned with response`,
        response.message
      );

      if (response.postActions?.length) {
        response.postActions.forEach((action) => {
          handlePostAction(action, interaction);
        });
      }
    } catch (error) {
      console.error("an error occurred. sending error response", error);
      response.message = `${error}`;
    }

    changeReply(interaction, response.message);
  }
};

export async function changeReply(
  interaction: CommandInteraction,
  content: HandlerResponseMessage
): Promise<void> {
  if (!content) return;
  try {
    interaction.editReply(content);
  } catch (error) {
    console.log("Could not change reply - error: ", error);
  }
}

const handlePostAction = (
  action: PostAction,
  interaction: Interaction<CacheType>
) => {
  const channel =
    action.data.channel ?? (interaction.channel as TextBasedChannel);

  if (
    action.action === PostActionType.printLeaderboardFiltered &&
    action.data.leaderboard
  ) {
    printFilteredLeaderboard(action.data.leaderboard, channel);
  } else if (
    action.action === PostActionType.printLeaderboard &&
    action.data.leaderboard
  ) {
    printLeaderboard(action.data.leaderboard, channel);
  } else if (
    action.action === PostActionType.printMultipleLeaderboards &&
    action.data.leaderboards
  ) {
    printMultipleLeaderboards(action.data.leaderboards, channel);
  } else if (
    action.action === PostActionType.printMultipleFilteredLeaderboards &&
    action.data.leaderboards
  ) {
    printMultipleFilteredLeaderboards(action.data.leaderboards, channel);
  } else {
    console.error(
      `could not execute post action ${action.action}. action name not found or data not correct`
    );
  }
};

export const getDMChannelToUser = async (
  userId: string
): Promise<DMChannel | null> => {
  const user = await client.users.fetch(userId);
  if (!user) return null;
  const channel = await user.createDM(true);
  return channel || null;
};

const compareCommandLists = (local: Command[], remote: Command[]): boolean => {
  if (local.length !== remote.length) {
    console.log("local and remote commands are not equal by count.");
    return false;
  }

  const localNames = mapCommandSimple(local);
  const remoteNames = mapCommandSimple(remote);
  if (localNames !== remoteNames) {
    console.log("local and remote commands are not equal by name.");
    return false;
  }

  const localOptions = local
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(mapCommandExtended);
  const remoteOptions = remote
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(mapCommandExtended);

  if (JSON.stringify(localOptions) !== JSON.stringify(remoteOptions)) {
    console.log("local and remote commands are not equal by deep comparison.");
    return false;
  }

  return true;
};

const mapCommandSimple = (commands: Command[]) => {
  return commands
    .map((c) => c.name)
    .sort()
    .join(",");
};

const mapCommandExtended = (c: Command) => {
  return {
    name: c.name,
    description: c.description,
    options: c.options?.map((o) =>
      [o.name, o.description, o.type, o.required || false].join(",")
    ),
  };
};
