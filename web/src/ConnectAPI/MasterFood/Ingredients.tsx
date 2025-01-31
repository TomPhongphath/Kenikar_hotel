import API from "../api";

const IngredientAPI = {
  getAll: async () => API.get("/ingredients"),
  getById: async (id: number) => API.get(`/ingredients/${id}`),
  getByName: async (name: string) => API.get(`/ingredients/name/${name}`),
  add: async (data: any) => API.post("/ingredients", data),
  update: async (id: number, data: any) => API.put(`/ingredients/${id}`, data),
  delete: async (id: number) => API.delete(`/ingredients/${id}`),
};

export default IngredientAPI;
