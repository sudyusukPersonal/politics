package models

type Party struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Color       string   `json:"color"`
	SupportRate int      `json:"supportRate"`
	OpposeRate  int      `json:"opposeRate"`
	TotalVotes  int      `json:"totalVotes"`
	Members     int      `json:"members"`
	KeyPolicies []string `json:"keyPolicies"`
	Description string   `json:"description"`
}

type Partys struct {
	Parties []Party `json:"parties"`
}