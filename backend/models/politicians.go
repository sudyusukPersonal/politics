package models

type Politician struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Position       string `json:"position"`
	Age            int    `json:"age"`
	Party          Party  `json:"party"`
	SupportRate    int    `json:"supportRate"`
	OpposeRate     int    `json:"opposeRate"`
	TotalVotes     int    `json:"totalVotes"`
	Activity       int    `json:"activity"`
	Image          string `json:"image"`
	Trending       string `json:"trending"`
	RecentActivity string `json:"recentActivity"`
}

type PoliticiansResponse struct {
	Politicians []Politician `json:"politicians"`
}