import { useAtomValue, useSetAtom } from 'jotai/react';
import { useEffect, useRef, useState } from 'react';
import { modalAtom, popModalAtom, pushModalAtom } from '../../atoms/modal';

interface ModalProps {
  children: React.ReactNode;
  clickClosable?: boolean;
  onClose?: () => void;
  bg?: string;
}

const Modal: React.FC<ModalProps> = ({
  clickClosable = false,
  children,
  onClose = () => null,
  bg,
}) => {
  const pop = useSetAtom(popModalAtom);
  const push = useSetAtom(pushModalAtom);
  const modal = useAtomValue(modalAtom);
  const [zIndex] = useState<string>(modal.zIndex);
  const currentElm = useRef(null);

  useEffect(() => {
    push();
    return () => pop();
  }, [push, pop]);

  return (
    <div
      ref={currentElm}
      className={`fixed inset-0 flex items-center justify-center bg-black/65 ${zIndex} ${bg}`}
      onClick={(e) => {
        if (clickClosable && currentElm.current === e.target) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
};

export default Modal;
