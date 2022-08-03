import { Command } from "../../types";
import {
  createLeaderboardCommand,
  createLeaderboardHandler,
} from "./create-leaderboard";
import { createEntryCommand, createEntryHandler } from "./create-entry";
import allleaderboards from "./allleaderboards";
import {
  deleteLeaderboardCommand,
  deleteLeaderboardHandler,
} from "./delete-leaderboard";
import help from "./help";
import { myleaderboards } from "./myleaderboards";
import { setProtectedCommand, setProtectedHandler } from "./set-protected";
import { addallowenceCommand, addallowenceHandler } from "./add-allowence";
import {
  cloneLeaderboardCommand,
  cloneLeaderboardHandler,
} from "./clone-leaderboard";
import {
  removeAllowenceCommand,
  removeAllowenceHandler,
} from "./removeallowence";

export const commandList: Array<Command> = [
  createLeaderboardCommand,
  createEntryCommand,
  setProtectedCommand,
  addallowenceCommand,
  cloneLeaderboardCommand,
  removeAllowenceCommand,
  deleteLeaderboardCommand,
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
};

export const legacyHandlers: { [key: string]: any } = {
  allleaderboards,

  myleaderboards,

  help,
};

export default handlers;
