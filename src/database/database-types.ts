export interface IEntryEntity extends Document {
  userId: string;
  time: number;
  notes?: string;
}

export interface ILeaderboardEntity extends Document {
  name: string;
  creatorId: string;
  guildId?: string;
  description?: string;
  protected?: boolean;
  allowedList?: string[];
  entries: IEntryEntity[];
}
