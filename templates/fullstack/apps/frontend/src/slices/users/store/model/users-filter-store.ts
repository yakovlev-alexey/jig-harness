import { atom } from 'nanostores';

export const usersFilterAtom = atom('');

export function setUsersFilter(value: string) {
  usersFilterAtom.set(value);
}
