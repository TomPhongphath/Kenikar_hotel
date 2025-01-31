import API from "../api";

const CategoryAPI = {
  getAll: async () => API.get("/categories"),
  getById: async (id: number) => API.get(`/categories/${id}`),
  getByName: async (name: string) => API.get(`/categories/name/${name}`),
  add: async (data: any) => API.post("/categories", data),
  update: async (id: number, data: any) => API.put(`/categories/${id}`, data),
  delete: async (id: number) => API.delete(`/categories/${id}`),
};

export default CategoryAPI;
