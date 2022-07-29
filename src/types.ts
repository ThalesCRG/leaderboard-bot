export interface Command {
  name: string;
  description: string;
  options?: Options[];
  guildId?: string;
  default_member_permissions?: string;
  dm_permission?: boolean;
}
export interface Options {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: Choices[];
}
export interface Choices {
  name: string;
  type: number;
  value?: string | number;
}
