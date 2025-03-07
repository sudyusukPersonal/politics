package models

type Comment struct {
	ID              string `json:"id"`
	Type            string `json:"type"`
	Text            string `json:"text"`
	User            string `json:"user"`
	Likes           int    `json:"likes"`
	Date            string `json:"date"`
	IsParentComment bool   `json:"isParentComment"`
	PoliticianID    string `json:"politicianId"`
	ParentID        string `json:"parentId,omitempty"`
	ReplyToID       string `json:"replyToId,omitempty"`
	ReplyToUser     string `json:"replyToUser,omitempty"`
}

// CommentsResponse はレスポンスのルート構造体を定義します
type CommentsResponse struct {
	Comments []Comment `json:"comments"`
}