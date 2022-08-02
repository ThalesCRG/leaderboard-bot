import {
  CacheType,
  Client,
  CommandInteraction,
  Intents,
  Interaction,
  TextBasedChannel,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";

import legacyCommands from "./legacy-commands.json";

import handlers, { commandList } from "./handlers";
import { useLegacyInteractionHandling } from "./legacy-interaction-handler";
import {
  HandlerResponse,
  HandlerResponseMessage,
  PostAction,
  PostActionType,
} from "../types";
import { printFilteredLeaderboard } from "../utils/messageUtils";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

export async function initConnection(token: string, appId: string) {
  console.log("trying bot login...");

  await client.login(token);

  console.log("Bot login successful");

  const rest = new REST({ version: "9" }).setToken(token);

  console.log("Started refreshing application (/) commands.");

  const commands = commandList.concat(legacyCommands);
  const response = (await rest.put(Routes.applicationCommands(appId), {
    body: commands,
  })) as Array<{ id: string; name: string }>;

  client.on("interactionCreate", handleInteractions);

  const cmdList = response.map((cmd) => {
    return { id: cmd.id, name: cmd.name };
  });
  console.log("updated commands", cmdList);
}

const handleInteractions = async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    // TODO: this is not needed, is it?
    if (!interaction.guild || !interaction.user?.id) {
      throw new Error("what shall i do if mandatory data is not present?");
    }

    await interaction.reply({ content: "wait a second", ephemeral: true });

    let response: HandlerResponse = { message: "no response retrieved" };

    if (handlers[interaction.commandName] === undefined) {
      console.log(
        `using legacy handler for command ${interaction.commandName}`
      );
      response.message = await useLegacyInteractionHandling(interaction);
    } else {
      console.log(
        `trying to use modern handler for command ${interaction.commandName}`
      );
      const definition = commandList.find(
        (cmd) => cmd.name === interaction.commandName
      );

      if (!definition) {
        return console.error(
          `could not find command definition for ${interaction.commandName}`
        );
      }

      if (!handlers[interaction.commandName]) {
        return console.error(
          `missing handler implementation for ${interaction.commandName}.`
        );
      }

      try {
        response = await handlers[interaction.commandName](
          interaction.options,
          interaction.user?.id,
          interaction.guildId
        );
      } catch (error) {
        console.log("an error occurred. sending error response");
        changeReply(interaction, `${error}`);
        return;
      }
    }

    console.log(
      `handler for ${interaction.commandName} returned with response`,
      response.message
    );

    if (response.postActions?.length) {
      response.postActions.forEach((action) => {
        handlePostAction(action, interaction);
      });
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
  if (action.action === PostActionType.printLeaderboardFiltered) {
    printFilteredLeaderboard(
      action.data,
      interaction.channel as TextBasedChannel
    );
  } else {
    console.error(`could not execute post action ${action.action}`);
  }
};
