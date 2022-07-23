export default interface command {
  name: string;
  description: string;
  options?: Options[];
}

interface Options {
  name: string;
  description: string;
  type: number;
  required: boolean;
}
