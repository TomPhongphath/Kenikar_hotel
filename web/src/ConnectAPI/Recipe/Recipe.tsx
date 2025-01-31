import API from "../api";

const RecipeAPI = {
  getAll: async () => API.get("/recipe"),
  add: async (data: any) => API.post("/recipe", data),
  addDetail: async (data: any) => API.post("/recipe/detail", data),
  getById: async (id: number) => API.get(`/recipe/${id}`),
};

export default RecipeAPI;