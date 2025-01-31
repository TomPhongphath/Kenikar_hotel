import API from "../api";

const UnitOfMeasurementAPI = {
  getAll: async () => API.get("/unit_of_measurements"),
  getById: async (id: number) => API.get(`/unit_of_measurements/${id}`),
  getByName: async (name: string) => API.get(`/unit_of_measurements/name/${name}`),
  add: async (data: any) => API.post("/unit_of_measurements", data),
  update: async (id: number, data: any) => API.put(`/unit_of_measurements/${id}`, data),
  delete: async (id: number) => API.delete(`/unit-of-measurements/${id}`),
};

export default UnitOfMeasurementAPI;
