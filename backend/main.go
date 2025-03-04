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

	// Routes
	e.GET("/", hello)
	e.GET("/users", getUsers)
	e.GET("/users/:id", getUser)

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