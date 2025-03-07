package services

import (
	"encoding/json"
	"io/ioutil"

	"github.com/sudyusukPersonal/politics/models"
)

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
