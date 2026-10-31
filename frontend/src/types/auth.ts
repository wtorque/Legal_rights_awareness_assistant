export interface NotificationPrefs {
  followUps: boolean;
  productUpdates: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  language: string;
  role: "user" | "admin";
  notifications: NotificationPrefs;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  /** Seconds the access token stays valid. */
  expiresIn: number;
  user: AuthUser;
}
