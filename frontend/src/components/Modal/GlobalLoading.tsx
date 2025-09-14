import Spin from '../Spin';
import Modal from './Modal';
import React from 'react';

const GlobalLoading: React.FC<{ show: boolean }> = React.memo(({ show }) => {
  if (!show) return null;

  return (
    <Modal>
      <Spin className="absolute left-1/2 top-1/2 -ml-20 -mt-20 h-40 w-40 text-blue0" />
    </Modal>
  );
});

export default GlobalLoading;
