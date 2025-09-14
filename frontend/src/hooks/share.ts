import { useCallback } from 'react';
import { showSucc } from '../utils/notify';
import { Spd } from './probabilityTable';

export const useShare = () => {
  const handleShareTable = useCallback(
    async (tableId: string, tableName: string) => {
      const url = `${window.location.origin}/play/tables/${tableId}`;
      const shareData = {
        title: 'Sortes',
        text: `Come to play pool ${tableName}!`,
        url,
      };

      // use Web Share API if browser support
      if (
        navigator.share !== undefined &&
        navigator.canShare !== undefined &&
        navigator.canShare(shareData)
      ) {
        navigator.share(shareData);
      }
      await navigator.clipboard.writeText(url);
      showSucc('Pool link copied to clipboard!');
    },
    []
  );
  const handleShareSpd = useCallback(async (spd: Spd) => {
    const url = `${window.location.origin}/play/spd-tables/${spd.id}`;
    const shareData = {
      title: 'Sortes',
      text: `Come to play pool ${spd.name}!`,
      url,
    };

    // use Web Share API if browser support
    if (
      navigator.share !== undefined &&
      navigator.canShare !== undefined &&
      navigator.canShare(shareData)
    ) {
      navigator.share(shareData);
    }
    await navigator.clipboard.writeText(url);
    showSucc('Pool link copied to clipboard!');
  }, []);
  return { handleShareTable, handleShareSpd };
};
