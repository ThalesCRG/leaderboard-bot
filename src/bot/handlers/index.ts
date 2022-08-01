import { Command } from "../../types";
import createleaderboard, {
  createLeaderboardOption,
} from "./createleaderboard";
import cloneleaderboard from "./cloneleaderboard";
import allleaderboards from "./allleaderboards";
import deleteleaderboard from "./deleteleaderboard";
import createentry from "./createentry";
import addallowence from "./addallowence";
import removeallowence from "./removeallowence";
import help from "./help";

export const commandList: Array<Command> = [createLeaderboardOption];

const handlers: { [key: string]: any } = {
  createleaderboard,
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
