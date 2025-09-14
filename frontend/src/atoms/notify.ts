import { atom } from 'jotai';
import { v4 as uuidv4 } from 'uuid';

export enum NotifyType {
  Succ = 0,
  Error = 1,
  Warning = 2,
  Notice = 3,
}

interface NotifyItem {
  type: NotifyType;
  msg: string;
}

export const notifyAtom = atom<{ [key in string]: NotifyItem }>({});

export const addNotifyAtom = atom(null, (get, set, notify: NotifyItem) => {
  set(notifyAtom, { ...get(notifyAtom), [uuidv4()]: notify });
});

export const removeNotifyAtom = atom(null, (get, set, id: string) => {
  const prev = get(notifyAtom);
  delete prev[id];
  set(notifyAtom, { ...prev });
});
