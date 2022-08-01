import { Command } from "../../types";
import {
  createLeaderboardCommand,
  createLeaderboardHandler,
} from "./createleaderboard";
import cloneleaderboard from "./cloneleaderboard";
import allleaderboards from "./allleaderboards";
import deleteleaderboard from "./deleteleaderboard";
import createentry from "./createentry";
import addallowence from "./addallowence";
import removeallowence from "./removeallowence";
import help from "./help";

export const commandList: Array<Command> = [createLeaderboardCommand];

/**
 * maps the registered command name (e.g. /createleaderboard) to the handler implementation.
 */
const handlers: { [key: string]: any } = {
  [createLeaderboardCommand.name]: createLeaderboardHandler,
};

export const legacyHandlers: { [key: string]: any } = {
  cloneleaderboard,
  deleteleaderboard,
  allleaderboards,

  createentry,

  addallowence,
  removeallowence,

  help,
};

export default handlers;
