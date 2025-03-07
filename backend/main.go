package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sudyusukPersonal/politics/models"
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
	e.GET("/politicians", PoliticiansHandler)
	e.GET("/users/:id", getId)
	e.GET("/comments", handleGetComments)
	e.GET("/parties", PartiesHandler)
	e.GET("/politicians/:id", GetPoliticianByIDHandler)
	e.GET("/parties/:id", GetPartiesByIDHandler2)



	// Start server
	e.Logger.Fatal(e.Start(":8080"))

	
}


// Handler
func GetPartiesByIDHandler2(c echo.Context) error {
	// URLパラメータから政党IDを取得
	id := c.Param("id")
	
	// IDが空の場合はエラーを返す
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "政党IDが指定されていません")
	}
	
	// 政党データファイルのパスを構築
	partyFilePath := filepath.Join("data", "parties.json")
	partyFileData, err := ioutil.ReadFile(partyFilePath)
	if err != nil {
		log.Printf("政党ファイル読み込みエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政党データの読み込みに失敗しました")
	}
	
	// 政党データをJSONからデコード
	var parties []models.Party
	err = json.Unmarshal(partyFileData, &parties)
	if err != nil {
		log.Printf("政党JSONパースエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政党データの解析に失敗しました")
	}
	
	// 対象の政党を検索
	var targetParty models.Party
	partyFound := false
	
	for _, party := range parties {
		if party.ID == id {
			targetParty = party
			partyFound = true
			break
		}
	}
	
	// 政党が見つからなかった場合はエラーを返す
	if !partyFound {
		return echo.NewHTTPError(http.StatusNotFound, "指定された政党は見つかりませんでした")
	}
	
	// 政治家データファイルのパスを構築
	politicianFilePath := filepath.Join("data", "politicians.json")
	politicianFileData, err := ioutil.ReadFile(politicianFilePath)
	if err != nil {
		log.Printf("政治家ファイル読み込みエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政治家データの読み込みに失敗しました")
	}
	
	// 政治家データをJSONからデコード
	var politicians []models.Politician
	err = json.Unmarshal(politicianFileData, &politicians)
	if err != nil {
		log.Printf("政治家JSONパースエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政治家データの解析に失敗しました")
	}
	
	// 指定された政党に所属する政治家をフィルタリング
	var partyMembers []models.Politician
	for _, politician := range politicians {
		if politician.Party.ID == id {
			partyMembers = append(partyMembers, politician)
		}
	}
	
	// 指定されたインターフェース形式に合わせたレスポンス構造体を定義
	type PartyResponse struct {
		Party   models.Party         `json:"party"`    // 政党情報
		Members []models.Politician  `json:"members"`  // 所属議員リスト
	}
	
	// レスポンスオブジェクトを作成
	response := PartyResponse{
		Party:   targetParty,
		Members: partyMembers,
	}
	
	// JSONレスポンスを返す
	return c.JSON(http.StatusOK, response)
}

func GetPoliticianByIDHandler(c echo.Context) error {
	// URLパラメータからIDを取得します
	id := c.Param("id")
	
	// IDが指定されていない場合はエラーを返します
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "政治家IDが指定されていません")
	}
	
	// JSONファイルからデータを読み込みます
	filePath := filepath.Join("data", "politicians.json")
	fileData, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Printf("ファイル読み込みエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政治家データの読み込みに失敗しました")
	}
	
	// JSON配列を政治家の配列としてパースします
	var politicians []models.Politician
	err = json.Unmarshal(fileData, &politicians)
	if err != nil {
		log.Printf("JSONパースエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政治家データの解析に失敗しました")
	}
	
	// 指定されたIDを持つ政治家を探します
	for _, politician := range politicians {
		if politician.ID == id {
			// 一致する政治家が見つかった場合、そのデータを返します
			return c.JSON(http.StatusOK, politician)
		}
	}
	
	// 一致する政治家が見つからなかった場合は404エラーを返します
	return echo.NewHTTPError(http.StatusNotFound, "指定された政治家は見つかりませんでした")
}

func GetPartiesByIDHandler(c echo.Context) error {
	// 
	id := c.Param("id")
	
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "政党IDが指定されていません")
	}
	
	filePath := filepath.Join("data", "parties.json")
	fileData, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Printf("ファイル読み込みエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政党データの読み込みに失敗しました")
	}
	
	var politicians []models.Party
	err = json.Unmarshal(fileData, &politicians)
	if err != nil {
		log.Printf("JSONパースエラー: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政党データの解析に失敗しました")
	}
	
	for _, politician := range politicians {
		if politician.ID == id {
			return c.JSON(http.StatusOK, politician)
		}
	}
	
	return echo.NewHTTPError(http.StatusNotFound, "指定された政治家は見つかりませんでした")
}


func PartiesHandler(c echo.Context) error {
	// JSONファイルからデータを読み込みます
	filePath := filepath.Join("data", "parties.json")
	fileData, err := ioutil.ReadFile(filePath)
	if err != nil {
		// エラーが発生した場合はログに記録し、クライアントにエラーレスポンスを返します
		log.Printf("Error reading parties file: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政党データの読み込みに失敗しました")
	}

	// JSON配列を政党の配列として解析します
	var parties []models.Party
	err = json.Unmarshal(fileData, &parties)
	if err != nil {
		// JSON解析エラーの場合もログに記録し、適切なエラーメッセージを返します
		log.Printf("Error parsing parties JSON: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "政党データの解析に失敗しました")
	}

	// Partys構造体にデータを格納します
	// これにより、JSONレスポンスのルートレベルに "parties" キーが追加されます
	response := models.Partys{
		Parties: parties,
	}

	// JSONレスポンスを返します
	return c.JSON(http.StatusOK, response)
}


func PoliticiansHandler(c echo.Context) error {
	// JSONファイルからデータを読み込む
	fileData, err := ioutil.ReadFile(filepath.Join("data", "politicians.json"))
	if err != nil {
		log.Printf("Error reading politicians file: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "データの読み込みに失敗しました")
	}

	// JSON配列を政治家の配列として解析
	var politicians []models.Politician
	err = json.Unmarshal(fileData, &politicians)
	if err != nil {
		log.Printf("Error parsing politicians JSON: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "データの解析に失敗しました")
	}

	// PoliticiansResponse構造体にデータを格納
	response := models.PoliticiansResponse{
		Politicians: politicians,
	}

	// JSONレスポンスを返す
	return c.JSON(http.StatusOK, response)
}

func handleGetComments(c echo.Context) error {
	commentsResponse, err := GetComments()
	if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Error fetching comments")
	}
	return c.JSON(http.StatusOK, commentsResponse)
}

func GetComments() (models.CommentsResponse, error) {
	fileData, err := ioutil.ReadFile("data/comments.json")
	if err != nil {
			return models.CommentsResponse{}, err
	}

	var commentsResponse models.CommentsResponse
	err = json.Unmarshal(fileData, &commentsResponse)
	if err != nil {
			return models.CommentsResponse{}, err
	}

	return commentsResponse, nil
}

func hello(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Welcome to Echo REST API",
	})
}

// Get all users
func getUsers(c echo.Context) error {
	return c.JSON(http.StatusOK, "getUsers")
}

// Get a user by ID
func getId(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id")
	}
	return c.JSON(http.StatusOK, id)
}