export const LEADERBOARDID_REGEX: RegExp = new RegExp("^[0-9a-fA-F]{24}$");
export const MAX_DESCRIPTION_LENGTH = 4096;
export const TIME_REGEX = /^[0-5]?[0-9][:][0-5][0-9][.]\d\d\d$/;

export enum UserInputErrors {
  LeaderboardIdError,
  DescriptionError,
  UserError,
  TimeParseError,
  LeaderboardTitleError,
}

export const ErorMessages: { [key: number]: string } = {
  [UserInputErrors.LeaderboardIdError]:
    "You did not pass a valid LeaderboardId. Please check your inputs. You can find the ID at the bottom of a Leaderboard or in the Bot Response when creating a Leaderboard.",
  [UserInputErrors.DescriptionError]:
    "Your description did not fit the required format. A Description must not be empty and not exeed a certain length.",
  [UserInputErrors.UserError]:
    "You did not provide a valid User. There should be at least one User that is suggested just above the text field.",
  [UserInputErrors.TimeParseError]:
    "Please check your Input. You did not provide a valid Time format. Try: mm:ss.SSS e.g. `01:15.195`",
  [UserInputErrors.LeaderboardTitleError]:
    "Please Check your Leaderboard Title. It might be too long.",
};
