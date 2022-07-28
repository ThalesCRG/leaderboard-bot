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
