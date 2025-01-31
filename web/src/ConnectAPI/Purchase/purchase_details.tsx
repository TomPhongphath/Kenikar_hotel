import API from "../api";

const PurchaseDetailAPI = {
  getAll: async () => API.get("/purchase_details"),
  add: async (data: any) => API.post("/purchase_details", data),
  getByingredient: async (id: number) => API.get(`/purchase_details/ingredient/${id}`),
  delete: async (id: number) => API.delete(`/purchase_details/${id}`),
  update: async (id: number, data: any) => API.put(`/purchase_details/${id}`, data),
  getById: async (id: number) => API.get(`/purchase_details/${id}`),
  getByPurchaseId: async (purchase_id: number) => API.get(`/purchase_details/purchase/${purchase_id}`),
};

export default PurchaseDetailAPI;
