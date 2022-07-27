import { Document, Schema } from "mongoose";

export interface IEntry extends Document {
  userId: string;
  time: number;
  notes?: string;
}

export interface ILeaderboard extends Document {
  name: string;
  creatorId: string;
  guildId?: string;
  description?: string;
  protected?: boolean;
  allowedList?: string[];
  entries: IEntry[];
}

const entrySchema = new Schema({
  userId: { type: String, required: true },
  time: { type: Number, required: true },
  notes: String,
});

const leaderboardSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: String, required: true },
  guildId: String,
  entries: [entrySchema],
  protected: Boolean,
  allowedList: [String],
});

export const Leaderboard = model<ILeaderboard>(
  "Leaderboard",
  leaderboardSchema
);
export const Entry = model<IEntry>("Entry", entrySchema);
