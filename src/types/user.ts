export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: Date;
  treeId?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
