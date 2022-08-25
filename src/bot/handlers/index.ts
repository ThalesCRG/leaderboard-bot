import { CommandLike } from "../../types";
import {
  createLeaderboardCommand,
  createLeaderboardHandler,
} from "./create-leaderboard";
import { createEntryCommand, createEntryHandler } from "./create-entry";
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
];

/**
 * maps the registered command name (e.g. /createleaderboard) to the handler implementation.
 */
const handlers: { [key: string]: any } = {
  [createLeaderboardCommand.name]: createLeaderboardHandler,
  [createEntryCommand.name]: createEntryHandler,
  [setProtectedCommand.name]: setProtectedHandler,
  [cloneLeaderboardCommand.name]: cloneLeaderboardHandler,
  [deleteLeaderboardCommand.name]: deleteLeaderboardHandler,
  [allLeaderboardsCommand.name]: allLeaderboardsHandler,
  [myLeaderboardsCommand.name]: myleaderboardsHandler,
  [helpCommand.name]: helpHandler,
  [setDescriptionCommand.name]: setDescriptionHandler,
  [allowenceCommand.name]: allowenceHandler,
};

export default handlers;
