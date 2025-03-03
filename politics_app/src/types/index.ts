// Basic types for the application

export interface Party {
  id: string;
  name: string;
  color: string;
  supportRate: number;
  opposeRate: number;
  totalVotes: number;
  members: number;
  keyPolicies: string[];
  description: string;
}

export interface Politician {
  id: string;
  name: string;
  position: string;
  age: number;
  party: {
    id: string;
    name: string;
    color: string;
  };
  supportRate: number;
  opposeRate: number;
  totalVotes: number;
  activity: number;
  image: string;
  trending: string;
  recentActivity: string;
}

export interface Reply {
  id: string;
  text: string;
  user: string;
  likes: number;
  date: string;
  replyTo?: string;
  replies?: Reply[];
}

export interface Comment {
  id: string;
  text: string;
  user: string;
  likes: number;
  date: string;
  replies: Reply[];
}

export interface ReasonsData {
  support: Comment[];
  oppose: Comment[];
}
