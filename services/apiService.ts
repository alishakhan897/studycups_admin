import type { ApiService } from "../types";

const BASE_URL = "https://studycupsbackend-wb8p.onrender.com/api";

// This version handles ALL backend formats without breaking DataManagement
export function createApi<T extends { id: any }>(endpoint: string) {
  return {
    // Always returns clean array (never object)
   getAll: async () => {
  const res = await fetch(`${BASE_URL}/${endpoint}`);
  const json = await res.json();

  return Array.isArray(json.data) ? json.data : [];
},

    // Dashboard needs raw object: {total,data}
    getRaw: async () => {
      const res = await fetch(`${BASE_URL}/${endpoint}`);
      return res.json();
    },

    add: async (item) => {
      const res = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      return res.json();
    },

    update: async (id, item) => {
      const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      return res.json();
    },

    delete: async (id) => {
      await fetch(`${BASE_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      });
    }
  };
}

export const dashboardApi = {
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) {
      throw new Error("Failed to load dashboard stats");
    }
    return res.json();
  },
};

import type { College, Course, Exam, Blog, Enquiry, User, Event } from "../types";

export const collegeApi = createApi<College>("colleges");
export const courseApi = createApi<Course>("courses");
export const examApi = createApi<Exam>("exams");
export const blogApi = createApi<Blog>("blogs");
export const enquiryApi = createApi<Enquiry>("enquiries");


export const eventApi = createApi<Event>("events");
export const userApi = createApi<User>("users");
