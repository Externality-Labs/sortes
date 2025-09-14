import { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { getProbabilityTable } from '../services/api/probabilityTable';
import { ProbabilityTable } from '../services/type';
import { getSpdTable, SpdTable } from '../services/api/spd';
import { probabilityTablesAtom } from '../atoms/probabilityTable';
import { useAtomValue } from 'jotai';

export const useProbabilityTable = (id: string) => {
  const probabilityTables = useAtomValue(probabilityTablesAtom);
  const probabilityTable = probabilityTables.find(
    (probabilityTable) => probabilityTable.id === id
  );
  return probabilityTable;
};

export interface Spd extends SpdTable {
  probabilityTable: ProbabilityTable;
}

export const useSpd = (id: string) => {
  const [spd, setSpd] = useState<Spd | null>(null);

  const loadSpdTable = useCallback(async () => {
    const table = await getSpdTable(id);
    const probabilityTable = await getProbabilityTable(
      table.probabilityTableId
    );
    setSpd({ ...table, probabilityTable });
  }, [id]);

  useEffect(() => {
    loadSpdTable();
  }, [loadSpdTable]);

  return spd;
};
