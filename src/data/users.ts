export type User = {
  id: string;
  /** Optional so each teammate can type their own name at login */
  name?: string;
  online: boolean;
};

export const USERS: User[] = [
  { id: "001", online: false },
  { id: "002", online: false },
  { id: "003", online: false },
  { id: "004", online: false },
  { id: "005", online: false },
];