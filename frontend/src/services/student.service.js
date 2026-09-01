import { api } from "./api.js";

/**
 * Every function here unwraps the backend's { success, message, data }
 * envelope (see backend Phase 2's apiResponse.js) down to just the
 * `data` payload the component actually needs, so pages never have to
 * know or care about that envelope shape.
 */
export const studentService = {
  async getProfile() {
    const { data } = await api.get("/student/profile");
    return data.data.profile;
  },

  async updateProfile(payload) {
    const { data } = await api.patch("/student/profile", payload);
    return data.data.profile;
  },

  /**
   * params: { search?, eligibleOnly? }
   * Matches backend's listDrives query params exactly (see
   * controllers/student/student.controller.js). Each returned drive
   * already has an `eligibility: { eligible, reasons }` field merged in
   * by the backend — nothing is recomputed on the client.
   */
  async listDrives(params = {}) {
    const { data } = await api.get("/student/drives", { params });
    return data.data; // { drives, count }
  },

  async getDriveDetails(driveId) {
    const { data } = await api.get(`/student/drives/${driveId}`);
    return data.data; // { drive, eligibility }
  },

  async applyToDrive(driveId) {
    const { data } = await api.post(`/student/drives/${driveId}/apply`);
    return data.data.application;
  },

  async listApplications() {
    const { data } = await api.get("/student/applications");
    return data.data; // { applications, count }
  },

  async getApplication(applicationId) {
    const { data } = await api.get(`/student/applications/${applicationId}`);
    return data.data.application;
  },

  async withdrawApplication(applicationId) {
    const { data } = await api.patch(`/student/applications/${applicationId}/withdraw`);
    return data.data.application;
  },
};
