// Malaysia's 13 states and 3 federal territories. Names are official proper nouns,
// so they are the same in both languages. The id is used by Radar (P4).
export const STATES = [
  { id: "johor", name: "Johor" },
  { id: "kedah", name: "Kedah" },
  { id: "kelantan", name: "Kelantan" },
  { id: "melaka", name: "Melaka" },
  { id: "negeri_sembilan", name: "Negeri Sembilan" },
  { id: "pahang", name: "Pahang" },
  { id: "perak", name: "Perak" },
  { id: "perlis", name: "Perlis" },
  { id: "pulau_pinang", name: "Pulau Pinang" },
  { id: "sabah", name: "Sabah" },
  { id: "sarawak", name: "Sarawak" },
  { id: "selangor", name: "Selangor" },
  { id: "terengganu", name: "Terengganu" },
  { id: "kuala_lumpur", name: "W.P. Kuala Lumpur" },
  { id: "labuan", name: "W.P. Labuan" },
  { id: "putrajaya", name: "W.P. Putrajaya" },
] as const;

export type StateId = (typeof STATES)[number]["id"];

export function stateName(id: string) {
  return STATES.find((s) => s.id === id)?.name ?? "";
}
