import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const contestService = {
  getUpcomingContests: () => api.get(ENDPOINTS.upcomingContests),
};
