import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  SnowflakeUtil,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CreateEntryModalOptions } from "./create-entry/create-entry.service";

export const handleButtonInteraction = async (
  interaction: ButtonInteraction
) => {
  const name = interaction.customId.split("-")[0];

  switch (name) {
    case "create-entry": // TODO: use enum
      createEntryButtonHandler(interaction);
      break;
    default:
      // TODO: at least log, oder throw
      return;
  }
};

const createEntryButtonHandler = async function (
  interaction: ButtonInteraction
) {
  const id = interaction.customId.split("-")[1];
  const addEntryModal = new ModalBuilder()
    .setCustomId(`addEntryModal-${id}-${SnowflakeUtil.generate()}`)
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

  interaction.showModal(addEntryModal);
};
