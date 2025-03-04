import { useNavigate } from "react-router-dom";
import { Politician, Party } from "../types";

export const useRouterNavigation = () => {
  const navigate = useNavigate();

  return {
    goToHome: () => navigate("/"),
    goToPoliticians: () => navigate("/politicians"),
    goToParties: () => navigate("/parties"),
    goToPoliticianDetail: (politician: Politician) =>
      navigate(`/politicians/${politician.id}`),
    goToPartyDetail: (party: Party) => navigate(`/parties/${party.id}`),
  };
};
