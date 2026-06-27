import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const emailPreferenceService = {
  get: () => api.get(ENDPOINTS.emailPreferences),
  update: (prefs) => api.put(ENDPOINTS.emailPreferences, prefs),
};
