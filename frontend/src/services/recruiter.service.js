import { api } from "./api.js";

export const recruiterService = {
  async getDashboardStats() {
    const { data } = await api.get("/recruiter/dashboard");
    return data.data; // { activeDrives, totalCandidates, shortlisted, interviews, offers }
  },

  async listDrives() {
    const { data } = await api.get("/recruiter/drives");
    return data.data; // { drives, count }
  },

  /**
   * The backend only supports filtering by `status` server-side (see
   * candidate.controller.js's listCandidates) - there is no `search`
   * query param on this endpoint. Name/email search is therefore done
   * client-side on the returned list (see Candidates.jsx), which is
   * reasonable given a single drive's candidate count is small, rather
   * than inventing a backend capability that doesn't exist.
   */
  async listCandidates(driveId, { status } = {}) {
    const params = {};
    if (status) params.status = status;
    const { data } = await api.get(`/recruiter/drives/${driveId}/candidates`, { params });
    return data.data; // { drive, applications, count }
  },

  async updateApplicationStatus(applicationId, payload) {
    const { data } = await api.patch(`/recruiter/applications/${applicationId}/status`, payload);
    return data.data.application;
  },
};
