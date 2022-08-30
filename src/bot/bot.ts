import {
  ApplicationCommand,
  AutocompleteInteraction,
  ButtonInteraction,
  CacheType,
  Client,
  CommandInteraction,
  DMChannel,
  Interaction,
  ModalSubmitInteraction,
  TextBasedChannel,
} from "discord.js";
import commandHandlers, {
  buttonHandlers,
  commands,
  modalHandlers,
} from "./handlers";
import {
  Command,
  CommandLike,
  HandlerResponse,
  HandlerResponseMessage,
  PostAction,
  PostActionType,
} from "../types";
import {
  printLeaderboard,
  printMultipleFilteredLeaderboards,
  printMultipleLeaderboards,
  updateLeaderboardMessages,
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
  console.log(`Bot ${client.user?.username} is up and running`);
}

const handleInteractions = async (interaction: Interaction<CacheType>) => {
  if (interaction.isModalSubmit()) {
    await handleModalSubmitInteraction(interaction);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  } else if (interaction.isCommand()) {
    await handleCommandInteraction(interaction);
  }
};

async function handleCommandInteraction(interaction: Interaction) {
  const commandInteraction = interaction as CommandInteraction;
  await commandInteraction.reply({ content: "wait a second", ephemeral: true });

  let response: HandlerResponse = { message: "no response retrieved" };

  try {
    response = await commandHandlers[commandInteraction.commandName](
      commandInteraction.options,
      commandInteraction.user?.id,
      commandInteraction.guildId
    );

    console.log(
      `handler for ${commandInteraction.commandName} returned with response`,
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

async function handleButtonInteraction(
  interaction: ButtonInteraction<CacheType>
) {
  const buttonInteraction = interaction as ButtonInteraction;
  // Do NOT reply. Once replied, a modal can not be shown anymore.
  const buttonType = buttonInteraction.customId.split("-")[0];

  let response: HandlerResponse;

  try {
    response = await buttonHandlers[buttonType](buttonInteraction);

    console.log(
      `handler for ${buttonType} returned with response`,
      response?.message
    );

    if (response?.postActions?.length) {
      response.postActions.forEach((action) => {
        handlePostAction(action, interaction);
      });
    }
  } catch (error) {
    console.error("an error occurred. sending error response", error);
    response = { message: `${error}` };
  }
  if (response?.message) {
    if (buttonInteraction.replied) {
      buttonInteraction.editReply({
        content: response.message as string,
      }); //muss repariert werden
    } else {
      buttonInteraction.reply({
        content: response.message as string,
        ephemeral: true,
      });
    }
  }
}

async function handleModalSubmitInteraction(
  interaction: ModalSubmitInteraction<CacheType>
) {
  const modalSubmitInteraction = interaction as ModalSubmitInteraction;

  let response: HandlerResponse = { message: "no response retrieved" };

  try {
    const modalSubmitType = modalSubmitInteraction.customId.split("-")[0];

    response = await modalHandlers[modalSubmitType](modalSubmitInteraction);
    console.log(
      `handler for ${modalSubmitType} returned with response`,
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
  modalSubmitInteraction.reply({
    content: response.message as string,
    ephemeral: true,
  });
}

export async function changeReply(
  interaction: Interaction,
  content: HandlerResponseMessage
): Promise<void> {
  if (!content) return;
  if (interaction instanceof AutocompleteInteraction<CacheType>) return;
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
    printLeaderboard(action.data.leaderboard, channel, true);
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
  } else if (
    action.action === PostActionType.updateLeaderboards &&
    action.data.leaderboard
  ) {
    updateLeaderboardMessages(action.data.leaderboard);
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

export async function fetchMessage(channelId: string, messageId: string) {
  const channel = await client.channels.fetch(channelId);
  if (!channel) return;
  const message = await (channel as TextBasedChannel).messages.fetch(messageId);
  return message;
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
