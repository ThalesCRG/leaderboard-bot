import { Command } from "../../types";
import {
  createLeaderboardCommand,
  createLeaderboardHandler,
} from "./create-leaderboard";
import { createEntryCommand, createEntryHandler } from "./create-entry";
import cloneleaderboard from "./cloneleaderboard";
import allleaderboards from "./allleaderboards";
import deleteleaderboard from "./deleteleaderboard";
import addallowence from "./addallowence";
import removeallowence from "./removeallowence";
import help from "./help";
import { myleaderboards } from "./myleaderboards";
import { setProtectedCommand, setProtectedHandler } from "./set-protected";

export const commandList: Array<Command> = [
  createLeaderboardCommand,
  createEntryCommand,
  setProtectedCommand,
];

/**
 * maps the registered command name (e.g. /createleaderboard) to the handler implementation.
 */
const handlers: { [key: string]: any } = {
  [createLeaderboardCommand.name]: createLeaderboardHandler,
  [createEntryCommand.name]: createEntryHandler,
  [setProtectedCommand.name]: setProtectedHandler,
};

export const legacyHandlers: { [key: string]: any } = {
  cloneleaderboard,
  deleteleaderboard,
  allleaderboards,
  addallowence,
  removeallowence,
  myleaderboards,

  help,
};

export default handlers;
