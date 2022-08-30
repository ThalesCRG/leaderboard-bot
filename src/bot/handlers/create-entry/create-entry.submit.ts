import { CreateEntryData } from "./create-entry.service";

export const convertSubmit = (): CreateEntryData => {
  // const parsedData: CreateEntryData = parseModalSubmitData(
  //     modalSubmitInteraction
  //   );

  //   const userId = modalSubmitInteraction.user.id;
  return {} as CreateEntryData;
};

// function parseModalSubmitData(
//     modalSubmitInteraction: ModalSubmitInteraction<CacheType>
//   ): CreateEntryData {
//     const components = modalSubmitInteraction.components
//       .map((comp) => comp.components as TextInputModalData[])
//       .flat();

//     const leaderboardId = modalSubmitInteraction.customId.split("-")[1] as string;

//     const notes = components.find(
//       (comp) => comp.customId === CreateEntryModalOptions.setNote
//     )?.value as string;

//     const time = components.find(
//       (comp) => comp.customId === CreateEntryModalOptions.setTime
//     )?.value as string;

//     const data: CreateEntryData = {
//       leaderboardId,
//       time,
//       notes,
//       clone: false,
//     };
//     return data;
//   }
