import { atom } from 'jotai';
import { debounce } from '../utils/helper';

interface ModalItem {
  layers: number;
  zIndex: string;
}

const classes = [
  'z-modal0',
  'z-modal1',
  'z-modal2',
  'z-modal3',
  'z-modal4',
  'z-modal5',
];

export const modalAtom = atom<ModalItem>({
  layers: 0,
  zIndex: classes[0],
});

export const popModalAtom = atom(null, (get, set) =>
  set(modalAtom, {
    layers: get(modalAtom).layers - 1,
    zIndex: classes[get(modalAtom).layers - 1],
  })
);

export const pushModalAtom = atom(null, (get, set) =>
  set(modalAtom, {
    layers: get(modalAtom).layers + 1,
    zIndex: classes[get(modalAtom).layers + 1],
  })
);

// Global Loading State
export const globalLoadingAtom = atom<boolean>(false);

// Global Conmfirm State
export const globalConfirmAtom = atom<{
  enable: boolean;
  text?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}>({ enable: false });

export const startLoadingAtom = atom(
  null,
  debounce((_, set) => {
    set(globalLoadingAtom, true);
  }, 300)
);
export const stopLoadingAtom = atom(
  null,
  debounce((_, set) => {
    set(globalLoadingAtom, false);
  }, 300)
);
