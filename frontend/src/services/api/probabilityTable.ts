import api from './index';
import { ProbabilityTable } from '../type';

export const getProbabilityTables = async (): Promise<ProbabilityTable[]> => {
  return await api.get('/probability-tables');
};

export const getProbabilityTable = async (
  id: string
): Promise<ProbabilityTable> => {
  return await api.get(`/probability-tables/${id}`);
};
