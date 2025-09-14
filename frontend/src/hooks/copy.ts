import { useCallback } from 'react';
import { showSucc } from '../utils/notify';
import { Spd } from './probabilityTable';

export const useCopyLink = () => {
  const handleCopyTableLink = useCallback(
    async (tableId?: string, route?: string) => {
      const finalUrl = tableId
        ? `${window.location.origin}/play/tables/${tableId}`
        : `${window.location.origin}/${route}`;

      await navigator.clipboard.writeText(finalUrl);
      showSucc('Link copied to clipboard.');
    },
    []
  );
  const handleCopySpdLink = useCallback(async (spd: Spd) => {
    const url = `${window.location.origin}/play/spd-tables/${spd.id}`;
    await navigator.clipboard.writeText(url);
    showSucc('Link copied to clipboard.');
  }, []);
  return { handleCopyTableLink, handleCopySpdLink };
};
