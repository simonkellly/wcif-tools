import { CurrentEventId } from "@wca/helpers";
import * as fs from "fs";
import { question } from "readline-sync";
import { ScriptDefinition } from "../types/ScriptDefinition";
import { GetWCIF } from "../utils/wca_api";

interface Dictionary<T> {
  [Key: string]: T;
}

const fullNames: Dictionary<string> = {
  "2x2x2": "222",
  "3x3x3": "333",
  "4x4x4": "444",
  "5x5x5": "555",
  "6x6x6": "666",
  "7x7x7": "777",
  "3x3x3 Blindfolded": "333bf",
  "3x3x3 Fewest Moves": "333fm",
  "3x3x3 One-Handed": "333oh",
  "Clock": "clock",
  "Megaminx": "minx",
  "Pyraminx": "pyram",
  "Skewb": "skewb",
  "Square-1": "sq1",
  "4x4x4 Blindfolded": "444bf",
  "5x5x5 Blindfolded": "555bf",
  "3x3x3 Multiple Blindfolded": "333mbf",
}

const eventNames: Dictionary<string> = {
  "222": "2x2",
  "333": "3x3",
  "444": "4x4",
  "555": "5x5",
  "666": "6x6",
  "777": "7x7",
  "333bf": "3BLD",
  "333fm": "FMC",
  "333oh": "OH",
  "clock": "Clock",
  "minx": "Mega",
  "pyram": "Pyra",
  "skewb": "Skewb",
  "sq1": "SQ-1",
  "444bf": "4BLD",
  "555bf": "5BLD",
  "333mbf": "MBLD",
}

interface Event {
  event: string;
  roundId: number;
}

function parseEventId(id: string): Event | null {
  if (!id) return null;
  if (id.length < 3) return null;
  const [event, round] = id.split("-");

  if (!Object.keys(eventNames).includes(event)) return null;
  const roundId = parseInt(round.substring(1)) ?? null;
  if (roundId == null || isNaN(roundId)) return null;

  return { event, roundId };
}

interface Password {
  password: string;
  event: string;
  round: number;
}

function parsePassword(password: string): Password {
  const actualPassword = password.substring(password.length - 8);

  const eventEnd = password.indexOf(" Round")

  const event = password.substring(0, eventEnd);
  const round = password.substring(eventEnd + 7, eventEnd + 8);
  const eventId = fullNames[event];
  const shortEventName = eventNames[eventId];


  const passwordString =  shortEventName + " R" + password
  .substring(eventEnd + 7)
  .replace(' Scramble Set ', ' ')
  .replace(' Attempt ', '-A');

  return {
    password: passwordString,
    event: eventId,
    round: parseInt(round)!,
  }
}

async function scramblePasswordOrganiser() {
  const competitionId = process.env.COMPETITION_ID ?? (await question("Competition ID: "));
  const wcif = await GetWCIF(competitionId);

  const passwordsFile = (
    process.env.PASSWORDS ?? (await question("Passwords File: "))
  ).replace(/(^'|'$)/g, "");
  const passwords = fs.readFileSync(passwordsFile, "utf8");

  const activities = wcif.schedule.venues
    ?.flatMap((venue) => venue.rooms)
    .flatMap((room) => room.activities);

  const sorted = activities!
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
    .map((activity) => {
      return parseEventId(activity.activityCode);
    })
    .filter((event) => event) as Event[];

  const parsedPasswords = passwords.split("\n").filter((p) => p).map((password) => {
    return parsePassword(password);
  });

  const sortedPasswords = parsedPasswords.sort((a: Password, b: Password) => {

    const firstIdx = sorted.findIndex((event) => event!.event === a.event && event.roundId === a.round);
    const secondIdx = sorted.findIndex((event) => event!.event === b.event && event.roundId === b.round);
    
    return firstIdx - secondIdx;
  }).map((password) => password.password);

  console.log(sortedPasswords.join("\n"));
}

export const ScramblePasswordOrganizer: ScriptDefinition = {
  action: scramblePasswordOrganiser,
  description: "ORGANIZE SCRAMBLE PASSWORDS",
};
