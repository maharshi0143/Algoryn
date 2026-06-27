import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const friendService = {
  list: () => api.get(ENDPOINTS.friends),
  pending: () => api.get(`${ENDPOINTS.friends}/pending`),
  sendRequest: (friendEmail) => api.post(ENDPOINTS.friends, { friendEmail }),
  accept: (id) => api.patch(`${ENDPOINTS.friends}/${id}/accept`),
  reject: (id) => api.patch(`${ENDPOINTS.friends}/${id}/reject`),
  block: (id) => api.patch(`${ENDPOINTS.friends}/${id}/block`),
  remove: (id) => api.delete(`${ENDPOINTS.friends}/${id}`),
};
