import { Competition } from "@wca/helpers";
import axios from "axios";

export async function GetWCIF(competitionId: string): Promise<Competition> {
  const apiUrl = `https://worldcubeassociation.org/api/v0/competitions/${competitionId}/wcif/public`;
  const res = await axios.get<Competition>(apiUrl);
  return res.data;
}
