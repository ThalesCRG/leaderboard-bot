import { CommandLike } from "../../types";
import {
  createLeaderboardCommand,
  createLeaderboardHandler,
} from "./create-leaderboard";
import {
  createEntryButtonHandler,
  createEntryButtonprefix,
  createEntryCommand,
  createEntryCommandHandler,
  createEntryModalPrefix,
  createEntryModalSubmitHandler,
} from "./create-entry";
import {
  deleteLeaderboardCommand,
  deleteLeaderboardHandler,
} from "./delete-leaderboard";
import { setProtectedCommand, setProtectedHandler } from "./set-protected";
import {
  cloneLeaderboardCommand,
  cloneLeaderboardHandler,
} from "./clone-leaderboard";
import {
  allLeaderboardsCommand,
  allLeaderboardsHandler,
} from "./all-leaderboards";
import {
  myLeaderboardsCommand,
  myleaderboardsHandler,
} from "./my-leaderboards";
import { helpCommand, helpHandler } from "./help";
import {
  setDescriptionCommand,
  setDescriptionHandler,
} from "./set-description";
import { allowenceCommand, allowenceHandler } from "./allowence";
import {
  updateLeaderboardCommand,
  updateLeaderboardHandler,
} from "./update-leaderboard";

export const commands: Array<CommandLike> = [
  createLeaderboardCommand,
  createEntryCommand,
  setProtectedCommand,
  cloneLeaderboardCommand,
  deleteLeaderboardCommand,
  allLeaderboardsCommand,
  myLeaderboardsCommand,
  helpCommand,
  setDescriptionCommand,
  allowenceCommand,
  updateLeaderboardCommand,
];

/**
 * maps the registered command name (e.g. /createleaderboard) to the handler implementation.
 */
const commandHandlers: { [key: string]: any } = {
  [createLeaderboardCommand.name]: createLeaderboardHandler,
  [createEntryCommand.name]: createEntryCommandHandler,
  [setProtectedCommand.name]: setProtectedHandler,
  [cloneLeaderboardCommand.name]: cloneLeaderboardHandler,
  [deleteLeaderboardCommand.name]: deleteLeaderboardHandler,
  [allLeaderboardsCommand.name]: allLeaderboardsHandler,
  [myLeaderboardsCommand.name]: myleaderboardsHandler,
  [helpCommand.name]: helpHandler,
  [setDescriptionCommand.name]: setDescriptionHandler,
  [allowenceCommand.name]: allowenceHandler,
  [updateLeaderboardCommand.name]: updateLeaderboardHandler,
};

export const buttonHandlers: { [key: string]: any } = {
  [createEntryButtonprefix]: createEntryButtonHandler,
};

export const modalHandlers: { [key: string]: any } = {
  [createEntryModalPrefix]: createEntryModalSubmitHandler,
};

export default commandHandlers;
