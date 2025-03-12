// src/types/index.ts
// アプリケーションの基本型定義

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
  furigana?: string; // ふりがなフィールドを追加（オプション）
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
  // フラット構造のための新しいプロパティ
  isParentComment: boolean; // 親コメントかどうかを示す
  parentId?: string; // 親コメントのID（親コメントの場合はnull）
  replyToId?: string; // 返信先コメントのID（親コメントまたは別の返信）
  replyToUser?: string; // 返信先のユーザー名
}

export interface ReasonsData {
  support: Comment[];
  oppose: Comment[];
}
