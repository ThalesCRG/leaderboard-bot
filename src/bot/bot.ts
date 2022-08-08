import {
  ApplicationCommand,
  CacheType,
  Client,
  CommandInteraction,
  DMChannel,
  Interaction,
  TextBasedChannel,
} from "discord.js";
import handlers, { commands } from "./handlers";
import {
  Command,
  CommandLike,
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
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

export async function initConnection(token: string) {
  console.log("trying bot login...");
  await client.login(token);
  console.log("bot login successful");

  const remoteCommands = Array.from(
    (await client.application?.commands.fetch())?.values() ?? []
  );

  const commandsUpToDate = compareCommandLists(
    commands,
    remoteCommands as Command[]
  );

  if (commandsUpToDate === false) {
    console.log("Started refreshing application (/) commands.");

    const response: Array<ApplicationCommand> = [];
    const deleteResponse: Array<ApplicationCommand> = [];

    // Remove old commands from remote
    for (const command of remoteCommands) {
      const response = await client.application?.commands.delete(command);
      if (response) deleteResponse.push(response);
    }

    for (const command of commands) {
      const commandResponse = await client.application?.commands.create(
        command
      );

      if (commandResponse) response.push(commandResponse);
    }

    const deletedCommands = deleteResponse.map((cmd) => {
      return { id: cmd.id, name: cmd.name };
    });
    console.log("deleted commands: ", deletedCommands);

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

const handlePostAction = async (
  action: PostAction,
  interaction: Interaction<CacheType>
) => {
  const channel =
    action.data.channel ?? (await fetchChannel(interaction.channelId));
  if (!channel)
    return console.error(
      `could not execute post action. Channel could not be resolved.`
    );

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
  const user = await client.users.fetch(userId, { force: true });
  if (!user) return null;
  const channel = await user.createDM(true);
  return channel || null;
};

async function fetchChannel(
  channelId: string | null
): Promise<TextBasedChannel | null> {
  if (!channelId) return null;
  return (await client.channels.fetch(channelId, {
    force: true,
  })) as TextBasedChannel;
}

const compareCommandLists = (
  local: CommandLike[],
  remote: CommandLike[]
): boolean => {
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

const mapCommandSimple = (commands: CommandLike[]) => {
  return commands
    .map((c) => c.name)
    .sort()
    .join(",");
};

const mapCommandExtended = (c: CommandLike) => {
  return {
    name: c.name,
    description: c.description,
    options:
      c.options?.map((o) =>
        [o.name, o.description, o.type, o.required || false].join(",")
      ) ?? [],
  };
};
