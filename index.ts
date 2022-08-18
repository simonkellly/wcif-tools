import { NoDNFs } from "./scripts/NoDNFs";
import { ScriptDefinition } from "./types/ScriptDefinition";
import "dotenv/config";
import { MostDNFs } from "./scripts/MostDNFs";
import { keyInSelect } from "readline-sync";
import { FastestNewcomer } from "./scripts/FastestNewcomer";
import { ScramblePasswordOrganizer } from "./scripts/ScramblePasswordOrganizer";

const scripts: ScriptDefinition[] = [ScramblePasswordOrganizer, NoDNFs, MostDNFs, FastestNewcomer];

const scriptIdx = keyInSelect(
  scripts.map((script) => script.description),
  "Which script would you like to run?"
);
if (scriptIdx !== -1) {
  scripts[scriptIdx].action();
}
