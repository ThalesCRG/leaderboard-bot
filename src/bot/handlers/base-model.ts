import { UserInputErrors } from "../../utils/UserInputUtils";

export abstract class BaseModel {
  errors: UserInputErrors[] = [];
  get isValid(): boolean {
    this.errors = [];
    this.validate();
    return this.errors.length === 0;
  }
  /**
   * adds an error to the model if the validator function returns false
   * @param validator function to retrieve validation result
   * @param error error to add, as UserInputErrors value
   */
  check(validator: () => any, error: UserInputErrors) {
    if (!!validator() === false) {
      this.errors.push(error);
    }
  }
  abstract validate(): void;
}
