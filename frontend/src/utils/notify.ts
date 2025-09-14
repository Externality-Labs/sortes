import { getDefaultStore } from 'jotai';
import { addNotifyAtom, NotifyType } from '../atoms/notify';

const store = getDefaultStore();

export const showError = (msg: string) => {
  store.set(addNotifyAtom, { msg, type: NotifyType.Error });
  console.error(msg);
};

export const showNotice = (msg: string) => {
  store.set(addNotifyAtom, { msg, type: NotifyType.Notice });
};

export const showSucc = (msg: string) => {
  store.set(addNotifyAtom, { msg, type: NotifyType.Succ });
};

export const showWarning = (msg: string) => {
  store.set(addNotifyAtom, { msg, type: NotifyType.Warning });
};
