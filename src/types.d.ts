export interface Command {
  name: string;
  description: string;
  options?: Options[];
}
export interface Options {
  name: string;
  description: string;
  type: number;
  required: boolean;
}
