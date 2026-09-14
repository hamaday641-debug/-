import { ProphetData } from './types';
import { EARLY_PROPHETS } from './earlyProphets';
import { PATRIARCHS_PROPHETS } from './patriarchsProphets';
import { MIDDLE_PROPHETS } from './middleProphets';
import { KINGS_AND_LATE_PROPHETS } from './kingsAndLateProphets';
import { PROPHET_MUHAMMAD } from './prophetMuhammad';

export * from './types';
export { EARLY_PROPHETS } from './earlyProphets';
export { PATRIARCHS_PROPHETS } from './patriarchsProphets';
export { MIDDLE_PROPHETS } from './middleProphets';
export { KINGS_AND_LATE_PROPHETS } from './kingsAndLateProphets';
export { PROPHET_MUHAMMAD } from './prophetMuhammad';

export const PROPHETS_DATA: ProphetData[] = [
  ...EARLY_PROPHETS,
  ...PATRIARCHS_PROPHETS,
  ...MIDDLE_PROPHETS,
  ...KINGS_AND_LATE_PROPHETS,
  PROPHET_MUHAMMAD,
];
