import { ErorMessages, UserInputErrors } from "../../utils/UserInputUtils";

export class ValidationError extends Error {
  constructor(errors: UserInputErrors[]) {
    const errorMesssage = errors
      .flatMap((error) => ErorMessages[error])
      .join("\n");
    super(errorMesssage);
  }
}
