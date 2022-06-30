import { question } from "readline-sync";
import { ScriptDefinition } from "../types/ScriptDefinition";
import { GetWCIF } from "../utils/wca_api";

async function mostDNFs() {
  // [registrationId, dnfCount]
  const dnfData = new Map<number, number>();
  const competitionId =
    process.env.COMPETITION_ID ?? (await question("Competition ID: "));
  const wcif = await GetWCIF(competitionId);
  const DNF = -1;

  wcif.events.forEach((event) =>
    event.rounds?.forEach((round) =>
      round.results?.forEach((result) =>
        result.attempts.forEach((attempt) => {
          const dnfCount = dnfData.get(result.personId) ?? 0;
          const attemptResult = attempt.result;

          if (attemptResult == DNF) {
            dnfData.set(result.personId, dnfCount + 1);
            return;
          }
        })
      )
    )
  );

  const validPersons = wcif.persons.filter(
    (person) => (dnfData.get(person.registrantId) ?? 0) > 0
  );

  const sortedPersons = validPersons.sort(
    (a, b) => dnfData.get(b.registrantId)! - dnfData.get(a.registrantId)!
  );

  sortedPersons.forEach((person) => {
    console.log(`${dnfData.get(person.registrantId)}: ${person.name}`);
  });
}

export const MostDNFs: ScriptDefinition = {
  action: mostDNFs,
  description: "WHO GOT THE MOST DNFS",
};
