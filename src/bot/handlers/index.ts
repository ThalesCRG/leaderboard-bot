import { Command } from "../../types";
import {
  createLeaderboardCommand,
  createLeaderboardHandler,
} from "./create-leaderboard";
import { createEntryCommand, createEntryHandler } from "./create-entry";
import cloneleaderboard from "./cloneleaderboard";
import allleaderboards from "./allleaderboards";
import deleteleaderboard from "./deleteleaderboard";
import removeallowence from "./removeallowence";
import help from "./help";
import { myleaderboards } from "./myleaderboards";
import { setProtectedCommand, setProtectedHandler } from "./set-protected";
import { addallowenceCommand, addallowenceHandler } from "./addallowence";

export const commandList: Array<Command> = [
  createLeaderboardCommand,
  createEntryCommand,
  setProtectedCommand,
  addallowenceCommand,
];

/**
 * maps the registered command name (e.g. /createleaderboard) to the handler implementation.
 */
const handlers: { [key: string]: any } = {
  [createLeaderboardCommand.name]: createLeaderboardHandler,
  [createEntryCommand.name]: createEntryHandler,
  [setProtectedCommand.name]: setProtectedHandler,
  [addallowenceCommand.name]: addallowenceHandler,
};

export const legacyHandlers: { [key: string]: any } = {
  cloneleaderboard,
  deleteleaderboard,
  allleaderboards,

  removeallowence,
  myleaderboards,

  help,
};

export default handlers;
