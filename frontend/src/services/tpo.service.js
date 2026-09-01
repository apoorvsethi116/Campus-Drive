import { api } from "./api.js";

export const tpoService = {
  async getDashboardStats() {
    const { data } = await api.get("/tpo/dashboard");
    return data.data;
  },

  /** params: { status?, search? } - matches drive.controller.js's listDrives exactly */
  async listDrives(params = {}) {
    const { data } = await api.get("/tpo/drives", { params });
    return data.data; // { drives, count }
  },

  async getDrive(id) {
    const { data } = await api.get(`/tpo/drives/${id}`);
    return data.data.drive;
  },

  async createDrive(payload) {
    const { data } = await api.post("/tpo/drives", payload);
    return data.data.drive;
  },

  async updateDrive(id, payload) {
    const { data } = await api.patch(`/tpo/drives/${id}`, payload);
    return data.data.drive;
  },

  async deleteDrive(id) {
    await api.delete(`/tpo/drives/${id}`);
  },

  async getEligibleStudents(driveId) {
    const { data } = await api.get(`/tpo/drives/${driveId}/eligible-students`);
    return data.data; // { eligibleCount, ineligibleCount, eligible, ineligible }
  },

  async getDriveApplicants(driveId) {
    const { data } = await api.get(`/tpo/drives/${driveId}/applicants`);
    return data.data; // { drive, applications, count }
  },

  async listRecruiters() {
    const { data } = await api.get("/tpo/recruiters");
    return data.data.recruiters;
  },

  /** params: { search?, branch?, minCGPA?, maxBacklogs? } */
  async listStudents(params = {}) {
    const { data } = await api.get("/tpo/students", { params });
    return data.data; // { students, count }
  },

  async getStudentById(id) {
    const { data } = await api.get(`/tpo/students/${id}`);
    return data.data.profile;
  },
};