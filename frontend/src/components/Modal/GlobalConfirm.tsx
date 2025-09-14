import { useAtomValue, useSetAtom } from 'jotai';
import Modal from './Modal';
import { useCallback } from 'react';
import { globalConfirmAtom } from '../../atoms/modal';
import React from 'react';

const GlobalConfirm: React.FC<{ show: boolean }> = ({ show }) => {
  const { text, onConfirm, onCancel } = useAtomValue(globalConfirmAtom);
  const setConfirm = useSetAtom(globalConfirmAtom);

  const handleClick = useCallback(
    (isConfirm: boolean) => {
      setConfirm({
        enable: false,
      });
      if (isConfirm) {
        onConfirm && onConfirm();
      } else {
        onCancel && onCancel();
      }
    },
    [onCancel, onConfirm, setConfirm]
  );

  if (!show) return null;

  return (
    <Modal>
      <div className="max-w-[600px] rounded-[16px] bg-white p-[20px] text-xl">
        <p className="mb-[20px]">
          <span className="mr-2 inline-block w-[34px] rounded-full border-[2px] border-solid border-warning text-center text-warning">
            !
          </span>
          <span className="font-normal">{text}</span>
        </p>

        <p className="flex justify-around text-white">
          <button
            className="w-[160px] rounded-[6px] bg-quaternary py-[6px]"
            onClick={() => handleClick(false)}
          >
            Cancel
          </button>
          <button
            className="w-[160px] rounded-[6px] bg-warning py-[6px]"
            onClick={() => handleClick(true)}
          >
            Confirm
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default GlobalConfirm;
