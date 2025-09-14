import { atom, getDefaultStore } from 'jotai';
import { ProbabilityTable } from '../services/type';
import { getProbabilityTables } from '../services/api/probabilityTable';

const store = getDefaultStore();

export const probabilityTablesAtom = atom<ProbabilityTable[]>([]);

export const setProbabilityTablesAtom = atom(
  null,
  (_, set, probabilityTables: ProbabilityTable[]) => {
    set(probabilityTablesAtom, probabilityTables);
  }
);

const initializeProbabilityTables = async () => {
  const probabilityTables = await getProbabilityTables();
  store.set(probabilityTablesAtom, probabilityTables);
};

initializeProbabilityTables();
