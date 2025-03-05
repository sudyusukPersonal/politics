package main

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// User represents user model
type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func main() {
	// Create a new Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins: []string{"*"},
    AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
    AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
}))

	// Routes
	e.GET("/", hello)
	e.GET("/users", getUsers)
	e.GET("/users/:id", getUser)
	e.GET("/comments", handleGetComments)


	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}

// Handler
func hello(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Welcome to Echo REST API",
	})
}

// Get all users
func getUsers(c echo.Context) error {
	users := []User{
		{ID: 1, Name: "one", Email: "tanaka@example.com"},
		{ID: 2, Name: "two", Email: "suzuki@example.com"},
		{ID: 3, Name: "three", Email: "yamada@example.com"},
	}
	return c.JSON(http.StatusOK, users)
}

// Get a user by ID
func getUser(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id")
	}
	user := User{
		ID:    id,
		Name:  "Tanaka",
		Email: "tanaka@example.com",
	}
	
	return c.JSON(http.StatusOK, user)
}

func handleGetComments(c echo.Context) error {
	// GetComments関数を呼び出してコメントデータを取得
	commentsResponse := GetComments()
	
	// JSONレスポンスを自動的に生成して返す
	// Echoはステータスコード、データ構造体を受け取り、JSONにシリアライズします
	return c.JSON(http.StatusOK, commentsResponse)
}

type Comment struct {
	ID             string `json:"id"`
	Type           string `json:"type"`
	Text           string `json:"text"`
	User           string `json:"user"`
	Likes          int    `json:"likes"`
	Date           string `json:"date"`
	IsParentComment bool   `json:"isParentComment"`
	PoliticianID   string `json:"politicianId"`
	ParentID       string `json:"parentId,omitempty"`
	ReplyToID      string `json:"replyToId,omitempty"`
	ReplyToUser    string `json:"replyToUser,omitempty"`
}

// CommentsResponse はレスポンスのルート構造体を定義します
type CommentsResponse struct {
	Comments []Comment `json:"comments"`
}

// GetComments は添付データと同じJSON構造を返す関数です
func GetComments() CommentsResponse {
	// コメントデータを作成
	comments := []Comment{
		// SUPPORT COMMENTS
		// PARENT COMMENT 1
		{
			ID:             "s1",
			Type:           "support",
			Text:           "wwwwwwwwwwwwwwion policy. The improvements in teacher conditions are particularly noteworthy.",
			User:           "CitizenA",
			Likes:          42,
			Date:           "2 days ago",
			IsParentComment: true,
			PoliticianID:   "p1", // 鈴木一郎 - education policy
		},
		// Replies to parent comment 1
		{
			ID:             "s1-r1",
			Type:           "support",
			Text:           "wwweewey do you like? Do you also value the teacher salary increase proposal?",
			User:           "EducationPro",
			Likes:          12,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1",
			ReplyToUser:    "CitizenA",
			PoliticianID:   "p1",
		},
		{
			ID:             "s1-r2",
			Type:           "support",
			Text:           "I partiafadfadddddddddddddddd the work style reforms for teachers and increased budget for ICT equipment. While salary increases are necessary, I believe improving the work environment should be prioritized.",
			User:           "CitizenA",
			Likes:          8,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1-r1",
			ReplyToUser:    "EducationPro",
			PoliticianID:   "p1",
		},
		{
			ID:             "s1-r3",
			Type:           "support",
			Text:           "ssssssssssssssSimply increasing salaries without improving workplace conditions won't change the situation.",
			User:           "AnotherTeacher",
			Likes:          5,
			Date:           "20 hours ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1-r2",
			ReplyToUser:    "CitizenA",
			PoliticianID:   "p1",
		},
		{
			ID:             "s1-r4",
			Type:           "support",
			Text:           "Adddddddddddddddddbeen teaching for 15 years, I can confirm that workplace environment is critical. Many teachers burn out due to administrative burdens, not just compensation issues.",
			User:           "SeniorTeacher",
			Likes:          18,
			Date:           "18 hours ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1-r3",
			ReplyToUser:    "AnotherTeacher",
			PoliticianID:   "p1",
		},
		{
			ID:             "s1-r5",
			Type:           "support",
			Text:           "Exdddddddddddddde of mine left the profession last year despite the recent small pay increases. The workload was simply unsustainable.",
			User:           "SchoolAdmin",
			Likes:          7,
			Date:           "15 hours ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1-r4",
			ReplyToUser:    "SeniorTeacher",
			PoliticianID:   "p1",
		},
		{
			ID:             "s1-r6",
			Type:           "support",
			Text:           "I alssssssssssssssscularly appreciate the support for rural schools.",
			User:           "RuralResident",
			Likes:          7,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1",
			ReplyToUser:    "CitizenA",
			PoliticianID:   "p1",
		},
		{
			ID:             "s1-r7",
			Type:           "support",
			Text:           "The rural school initiative is game-changing for my community. We've struggled with attracting qualified teachers for years.",
			User:           "CountyOfficial",
			Likes:          9,
			Date:           "22 hours ago",
			IsParentComment: false,
			ParentID:       "s1",
			ReplyToID:      "s1-r6",
			ReplyToUser:    "RuralResident",
			PoliticianID:   "p1",
		},

		// PARENT COMMENT 2
		{
			ID:             "s2",
			Type:           "support",
			Text:           "I'm impressed by how they address local issues. Their quick response to recent flood damage was commendable.",
			User:           "TokyoResident",
			Likes:          27,
			Date:           "4 days ago",
			IsParentComment: true,
			PoliticianID:   "p9", // 小林拓也 - local initiatives
		},
		// Replies to parent comment 2
		{
			ID:             "s2-r1",
			Type:           "support",
			Text:           "Agreed! They were on the ground within hours assessing damage and coordinating relief efforts.",
			User:           "DisasterRelief",
			Likes:          14,
			Date:           "3 days ago",
			IsParentComment: false,
			ParentID:       "s2",
			ReplyToID:      "s2",
			ReplyToUser:    "TokyoResident",
			PoliticianID:   "p9",
		},
		{
			ID:             "s2-r2",
			Type:           "support",
			Text:           "This is what proper representation looks like. I remember when my neighborhood was affected by the flooding, and they personally visited to ensure aid was being distributed effectively.",
			User:           "FloodSurvivor",
			Likes:          22,
			Date:           "3 days ago",
			IsParentComment: false,
			ParentID:       "s2",
			ReplyToID:      "s2",
			ReplyToUser:    "TokyoResident",
			PoliticianID:   "p9",
		},
		{
			ID:             "s2-r3",
			Type:           "support",
			Text:           "Was aid actually distributed fairly though? Some reports suggest certain neighborhoods were prioritized over others.",
			User:           "ConcernedCitizen",
			Likes:          6,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "s2",
			ReplyToID:      "s2-r2",
			ReplyToUser:    "FloodSurvivor",
			PoliticianID:   "p9",
		},
		{
			ID:             "s2-r4",
			Type:           "support",
			Text:           "I work in emergency management, and from what I observed, resources were allocated based on damage assessment, not neighborhood status. The process was quite transparent.",
			User:           "EmergencyManager",
			Likes:          18,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "s2",
			ReplyToID:      "s2-r3",
			ReplyToUser:    "ConcernedCitizen",
			PoliticianID:   "p9",
		},

		// PARENT COMMENT 3
		{
			ID:             "s3",
			Type:           "support",
			Text:           "Their climate change initiatives are truly forward-thinking. The commitment to carbon neutrality by 2035 is ambitious but necessary.",
			User:           "EnvironmentAdvocate",
			Likes:          35,
			Date:           "3 days ago",
			IsParentComment: true,
			PoliticianID:   "p3", // 佐藤健太 - environmental initiatives
		},
		// Replies to parent comment 3
		{
			ID:             "s3-r1",
			Type:           "support",
			Text:           "I'm concerned about the economic impacts of such rapid transition. Will there be support for affected industries?",
			User:           "EconomicAnalyst",
			Likes:          8,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "s3",
			ReplyToID:      "s3",
			ReplyToUser:    "EnvironmentAdvocate",
			PoliticianID:   "p3",
		},
		{
			ID:             "s3-r2",
			Type:           "support",
			Text:           "If you look at section 4 of their policy document, they've outlined a comprehensive transition plan with $2.5B allocated for retraining and industry transition support.",
			User:           "PolicyExpert",
			Likes:          15,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "s3",
			ReplyToID:      "s3-r1",
			ReplyToUser:    "EconomicAnalyst",
			PoliticianID:   "p3",
		},
		{
			ID:             "s3-r3",
			Type:           "support",
			Text:           "That's reassuring. I've seen too many climate initiatives fail because they neglect the economic realities facing workers and communities.",
			User:           "EconomicAnalyst",
			Likes:          11,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "s3",
			ReplyToID:      "s3-r2",
			ReplyToUser:    "PolicyExpert",
			PoliticianID:   "p3",
		},
		{
			ID:             "s3-r4",
			Type:           "support",
			Text:           "Having worked in renewable energy transition, I can say their approach is among the most comprehensive I've seen. They've learned from mistakes in other regions.",
			User:           "EnergyConsultant",
			Likes:          19,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "s3",
			ReplyToID:      "s3-r3",
			ReplyToUser:    "EconomicAnalyst",
			PoliticianID:   "p3",
		},

		// OPPOSE COMMENTS
		// PARENT COMMENT 1
		{
			ID:             "o1",
			Type:           "oppose",
			Text:           "ooooooooooocy lacks consistency. They previously advocated fiscal austerity but suddenly changed direction before the election.",
			User:           "PoliticsEnthusiast",
			Likes:          31,
			Date:           "1 day ago",
			IsParentComment: true,
			PoliticianID:   "p2", // 田中花子 - fiscal reform issues
		},
		// Replies to parent comment 1
		{
			ID:             "o1-r1",
			Type:           "oppose",
			Text:           "dddddddddbe seen as flexibly responding to changing circumstances?",
			User:           "DifferentPerspective",
			Likes:          5,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "o1",
			ReplyToID:      "o1",
			ReplyToUser:    "PoliticsEnthusiast",
			PoliticianID:   "p2",
		},
		{
			ID:             "o1-r2",
			Type:           "oppose",
			Text:           "to r1   tency are different. Specifically, statements in the budget committee two years ago directly contradict current election promises.",
			User:           "PoliticsEnthusiast",
			Likes:          14,
			Date:           "23 hours ago",
			IsParentComment: false,
			ParentID:       "o1",
			ReplyToID:      "o1-r1",
			ReplyToUser:    "DifferentPerspective",
			PoliticianID:   "p2",
		},
		{
			ID:             "o1-r3",
			Type:           "oppose",
			Text:           "to r2   f these contradictions? I'm genuinely interested in seeing the evidence.",
			User:           "FactChecker",
			Likes:          12,
			Date:           "20 hours ago",
			IsParentComment: false,
			ParentID:       "o1",
			ReplyToID:      "o1-r2",
			ReplyToUser:    "PoliticsEnthusiast",
			PoliticianID:   "p2",
		},
		{
			ID:             "o1-r4",
			Type:           "oppose",
			Text:           "to r2  'We must prioritize debt reduction over new spending initiatives.' Campaign speech last month: 'We will launch the largest infrastructure investment in a decade without raising taxes.'",
			User:           "PoliticsEnthusiast",
			Likes:          23,
			Date:           "18 hours ago",
			IsParentComment: false,
			ParentID:       "o1",
			ReplyToID:      "o1-r2",
			ReplyToUser:    "PoliticsEnthusiast",
			PoliticianID:   "p2",
		},
		{
			ID:             "o1-r5",
			Type:           "oppose",
			Text:           "to r2  ajfaofjaoote that economic conditions have changed significantly since February 2023.",
			User:           "FactChecker",
			Likes:          8,
			Date:           "16 hours ago",
			IsParentComment: false,
			ParentID:       "o1",
			ReplyToID:      "o1-r2",
			ReplyToUser:    "PoliticsEnthusiast",
			PoliticianID:   "p2",
		},
		{
			ID:             "o1-r6",
			Type:           "oppose",
			Text:           "I think voters deserve explicit explanations when major policy positions change. Otherwise it feels like pandering.",
			User:           "TransparencyAdvocate",
			Likes:          19,
			Date:           "14 hours ago",
			IsParentComment: false,
			ParentID:       "o1",
			ReplyToID:      "o1-r5",
			ReplyToUser:    "FactChecker",
			PoliticianID:   "p2",
		},

		// PARENT COMMENT 2
		{
			ID:             "o2",
			Type:           "oppose",
			Text:           "They have minimal local activity and limited speeches in parliament. I wish they would be more proactive.",
			User:           "LocalResident",
			Likes:          19,
			Date:           "3 days ago",
			IsParentComment: true,
			PoliticianID:   "p4", // 山田太郎 - low activity score
		},
		// Replies to parent comment 2
		{
			ID:             "o2-r1",
			Type:           "oppose",
			Text:           "Absolutely. I've tried to meet with them at local town halls three times, and they've never shown up.",
			User:           "TownHallAttendee",
			Likes:          11,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "o2",
			ReplyToID:      "o2",
			ReplyToUser:    "LocalResident",
			PoliticianID:   "p4",
		},
		{
			ID:             "o2-r2",
			Type:           "oppose",
			Text:           "This seems to be a pattern with politicians from this party. They're active before elections then disappear until the next campaign.",
			User:           "PatternSpotter",
			Likes:          15,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "o2",
			ReplyToID:      "o2",
			ReplyToUser:    "LocalResident",
			PoliticianID:   "p4",
		},

		// PARENT COMMENT 3
		{
			ID:             "o3",
			Type:           "oppose",
			Text:           "Their healthcare policy ignores the critical shortage of medical professionals in rural areas. There's no concrete plan to address this issue.",
			User:           "RuralDoctor",
			Likes:          27,
			Date:           "4 days ago",
			IsParentComment: true,
			PoliticianID:   "p8", // 中村誠 - policy criticism
		},
		// Replies to parent comment 3
		{
			ID:             "o3-r1",
			Type:           "oppose",
			Text:           "Have you seen their supplementary healthcare document? There's a section on rural healthcare workforce development.",
			User:           "PolicyReader",
			Likes:          5,
			Date:           "3 days ago",
			IsParentComment: false,
			ParentID:       "o3",
			ReplyToID:      "o3",
			ReplyToUser:    "RuralDoctor",
			PoliticianID:   "p8",
		},
		{
			ID:             "o3-r2",
			Type:           "oppose",
			Text:           "I've read it. It only allocates a symbolic budget with no specific recruitment or retention strategies. As someone working in the field, it's clearly insufficient.",
			User:           "RuralDoctor",
			Likes:          21,
			Date:           "3 days ago",
			IsParentComment: false,
			ParentID:       "o3",
			ReplyToID:      "o3-r1",
			ReplyToUser:    "PolicyReader",
			PoliticianID:   "p8",
		},
		{
			ID:             "o3-r3",
			Type:           "oppose",
			Text:           "I agree with RuralDoctor. I'm a nurse in a rural clinic, and we've been critically understaffed for years with no relief in sight.",
			User:           "RuralNurse",
			Likes:          18,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "o3",
			ReplyToID:      "o3-r2",
			ReplyToUser:    "RuralDoctor",
			PoliticianID:   "p8",
		},
		{
			ID:             "o3-r4",
			Type:           "oppose",
			Text:           "The problem is that policy makers create these plans in urban centers without consulting those of us actually working in rural healthcare.",
			User:           "RuralAdministrator",
			Likes:          14,
			Date:           "2 days ago",
			IsParentComment: false,
			ParentID:       "o3",
			ReplyToID:      "o3-r3",
			ReplyToUser:    "RuralNurse",
			PoliticianID:   "p8",
		},
		{
			ID:             "o3-r5",
			Type:           "oppose",
			Text:           "They should implement a mandatory rural service requirement for medical school graduates, like they do in some countries.",
			User:           "PolicySuggester",
			Likes:          7,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "o3",
			ReplyToID:      "o3",
			ReplyToUser:    "RuralDoctor",
			PoliticianID:   "p8",
		},
		{
			ID:             "o3-r6",
			Type:           "oppose",
			Text:           "Mandatory service has mixed results and can affect recruitment to medical school. Better incentives and rural medical education have shown better outcomes.",
			User:           "MedicalEducator",
			Likes:          12,
			Date:           "1 day ago",
			IsParentComment: false,
			ParentID:       "o3",
			ReplyToID:      "o3-r5",
			ReplyToUser:    "PolicySuggester",
			PoliticianID:   "p8",
		},
	}

	// 作成したコメントデータをレスポンス構造体に格納
	return CommentsResponse{
		Comments: comments,
	}
}
