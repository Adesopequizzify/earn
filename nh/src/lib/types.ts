export interface UserData {
  telegramId: string;
  username: string;
  points: number;
  rank: string;
  referralCode: string;
  createdAt: Date;
  lastLogin: Date;
  completedTasks: string[];
  languageCode: string | null;
}

export interface ReferralData {
  referrerId: string;
  referredId: string;
  timestamp: Date;
  pointsAwarded: number;
}

