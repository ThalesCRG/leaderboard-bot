import { DataHolder } from "../../../types";
import { CreateEntryData, CreateEntryOption } from "./create-entry.service";

export const convertCommand = (
  data: DataHolder,
  user: string
): CreateEntryData => {
  return {
    leaderboardId: data.getString(CreateEntryOption.leaderboardId, true),
    time: data.getString(CreateEntryOption.time, true),
    driver: data.getUser(CreateEntryOption.driver)?.id ?? user,
    notes: data.getString(CreateEntryOption.notes),
    clone: data.getBoolean(CreateEntryOption.clone),
  } as CreateEntryData;
};
