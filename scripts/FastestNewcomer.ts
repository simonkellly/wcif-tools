import {
  Competition,
  decodeMultiResult,
  Event,
  getEventName,
  isDnf,
  isDns,
  isMultiResult,
  isMultiResultDnf,
  Person,
} from "@wca/helpers";
import { keyInSelect, question } from "readline-sync";
import { ScriptDefinition } from "../types/ScriptDefinition";
import { GetWCIF } from "../utils/wca_api";

function getEventResults(
  wcif: Competition,
  event: Event
): (Person | undefined)[] | undefined {
  const finalRound = event.rounds?.at(-1);
  const actualResults = finalRound?.results?.filter((result) => {
    const best = result.best;
    return !isMultiResultDnf(decodeMultiResult(best));
  });
  const results = actualResults
    ?.filter((result) => result.best)
    .sort((a, b) => (a.ranking ?? 99999) - (b?.ranking ?? 99999));
  return results?.map((result) =>
    wcif.persons.find((person) => person.registrantId == result.personId)
  );
}

async function fastestNewcomer() {
  const competitionId =
    process.env.COMPETITION_ID ?? (await question("Competition ID: "));
  const wcif = await GetWCIF(competitionId);

  const newCompetitors = wcif.persons.filter((person) => person.wcaId == null);
  const events = wcif.events.map((event) => getEventName(event.id));

  const scriptIdx = keyInSelect(events, "Pick an event");
  if (scriptIdx == -1) return;

  const results = getEventResults(wcif, wcif.events[scriptIdx]);
  if (!results) return;

  results
    .filter((r) => !r?.wcaId)
    .forEach((result) => console.log(result?.name));
}

export const FastestNewcomer: ScriptDefinition = {
  action: fastestNewcomer,
  description: "WHO IS THE FASTEST NEWCOMER",
};
