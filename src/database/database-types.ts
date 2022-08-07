export interface IEntryEntity extends Document {
  userId: string;
  time: number;
  notes?: string;
}

export interface ILeaderboardEntity extends Document {
  id: string | undefined;
  name: string;
  creatorId: string;
  guildId?: string;
  description: string;
  protected?: boolean;
  allowedList?: string[];
  entries: IEntryEntity[];
}

export interface Allowence {
  userId: string;
  leaderboardId: string;
}

export interface ProtectedResponse {
  leaderboardId: string;
  protectedFlag: boolean;
}
