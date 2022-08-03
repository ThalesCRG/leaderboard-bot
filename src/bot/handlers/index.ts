import { Command } from "../../types";
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
import { addallowenceCommand, addallowenceHandler } from "./add-allowence";
import {
  cloneLeaderboardCommand,
  cloneLeaderboardHandler,
} from "./clone-leaderboard";
import {
  removeAllowenceCommand,
  removeAllowenceHandler,
} from "./remove-allowence";
import {
  allLeaderboardsCommand,
  allLeaderboardsHandler,
} from "./all-leaderboards";
import {
  myLeaderboardsCommand,
  myleaderboardsHandler,
} from "./my-leaderboards";
import { helpCommand, helpHandler } from "./help";

export const commands: Array<Command> = [
  createLeaderboardCommand,
  createEntryCommand,
  setProtectedCommand,
  addallowenceCommand,
  cloneLeaderboardCommand,
  removeAllowenceCommand,
  deleteLeaderboardCommand,
  allLeaderboardsCommand,
  myLeaderboardsCommand,
  helpCommand,
];

/**
 * maps the registered command name (e.g. /createleaderboard) to the handler implementation.
 */
const handlers: { [key: string]: any } = {
  [createLeaderboardCommand.name]: createLeaderboardHandler,
  [createEntryCommand.name]: createEntryHandler,
  [setProtectedCommand.name]: setProtectedHandler,
  [addallowenceCommand.name]: addallowenceHandler,
  [cloneLeaderboardCommand.name]: cloneLeaderboardHandler,
  [removeAllowenceCommand.name]: removeAllowenceHandler,
  [deleteLeaderboardCommand.name]: deleteLeaderboardHandler,
  [allLeaderboardsCommand.name]: allLeaderboardsHandler,
  [myLeaderboardsCommand.name]: myleaderboardsHandler,
  [helpCommand.name]: helpHandler,
};

export default handlers;
