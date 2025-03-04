// types/index.ts (MODIFIED)
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

export interface Comment {
  replies: any;
  id: string;
  text: string;
  user: string;
  likes: number;
  date: string;
  // New properties for flattened structure
  isParentComment: boolean; // Indicates if this is a parent comment or a reply
  parentId?: string; // ID of the parent comment (null for parent comments)
  replyToId?: string; // ID of the comment being replied to (could be parent or another reply)
  replyToUser?: string; // Username of the person being replied to
}

export interface ReasonsData {
  support: Comment[];
  oppose: Comment[];
}
