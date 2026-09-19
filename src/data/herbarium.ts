import type { JournalEntry } from './journalTypes';

export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export function normalize(value: string) {
  return value.toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').trim();
}
export function plantGroup(entry: JournalEntry): string {
  const groups: [string, string[]][] = [
    ['Gemüse', ['gemuese']], ['Obst', ['obst', 'frucht', 'fruechte', 'beere', 'beeren', 'zitrus']],
    ['Kräuter', ['kraut', 'kraeuter']], ['Blüten', ['bluete', 'blueten', 'essbare blueten', 'essbare blumen']],
    ['Wildpflanzen', ['wildpflanze', 'wildpflanzen', 'wildkraeuter']],
  ];
  for (const value of [entry.category, entry.typ ?? '']) {
    const match = groups.find(([, aliases]) => aliases.includes(normalize(value)));
    if (match) return match[0];
  }
  return entry.category || entry.typ || 'Weitere';
}
export function matchesSearch(entry: JournalEntry, query: string) {
  return normalize([entry.title, entry.latinName, entry.category, entry.typ, entry.tastingNotes, entry.usage, entry.pairings].filter(Boolean).join(' ')).includes(normalize(query));
}
export function seasonMonthIndexes(values: string[] = []) {
  return [...new Set(values.map(value => MONTHS.findIndex(month => normalize(month) === normalize(value))).filter(index => index >= 0))].sort((a,b) => a-b);
}

export function matchesSeason(entry: JournalEntry, season: string) {
  const indexes = seasonMonthIndexes(entry.seasonMonths);
  const seasonIndexes: Record<string, number[]> = { Frühling: [2,3,4], Sommer: [5,6,7], Herbst: [8,9,10], Winter: [11,0,1] };
  if (indexes.length && seasonIndexes[season]) return indexes.some(index => seasonIndexes[season].includes(index));
  return entry.season === season;
}
