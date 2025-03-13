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

// export interface Comment {
//   replies: any;
//   id: string;
//   text: string;
//   user: string;
//   likes: number;
//   date: string;
//   // フラット構造のための新しいプロパティ
//   isParentComment: boolean; // 親コメントかどうかを示す
//   parentId?: string; // 親コメントのID（親コメントの場合はnull）
//   replyToId?: string; // 返信先コメントのID（親コメントまたは別の返信）
//   replyToUser?: string; // 返信先のユーザー名
// }

export interface ReasonsData {
  support: Comment[];
  oppose: Comment[];
}

// Updated comment types to match Firebase structure
export interface ReplyTo {
  replyID?: string;
  replyToUserID: string;
  replyToUserName: string;
}

export interface Reply {
  user_name: string;
  reply_to: any;
  id: string;
  text: string;
  userID: string;
  userName: string;
  createdAt: string | Date;
  likes: number;
  replyTo?: ReplyTo;
}

export interface Comment {
  id: string;
  text: string;
  userID: string;
  userName: string;
  politicianID: string;
  createdAt: string | Date;
  likes: number;
  replies: Reply[];
  repliesCount: number;
  type: "support" | "oppose";
}
