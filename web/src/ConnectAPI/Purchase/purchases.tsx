import API from "../api";

const PurchaseAPI = {
  getAll: async () => API.get("/purchases"),
  add: async (data: any) => API.post("/purchases", data),
  delete: async (id: number) => API.delete(`/purchases/${id}`),
  update: async (id: number, data: any) => API.put(`/purchases/${id}`, data),
  getById: async (id: number) => API.get(`/purchases/${id}`),
  getByTotalPrice: async (total_price: number) => API.get(`/purchases/total_price/${total_price}`),
  getByApproveStatus: async (status: string) => API.get(`/purchases/approve_status/${status}`),
};

export default PurchaseAPI;
