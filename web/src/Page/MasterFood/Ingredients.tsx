import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { GridComponent, ColumnsDirective, ColumnDirective, ExcelExport, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";
import { ToolbarItems } from "@syncfusion/ej2-react-grids";
import IngredientsAPI from "../../ConnectAPI/MasterFood/Ingredients";
import CategoryAPI from "../../ConnectAPI/MasterFood/Category";
import UnitOfMeasurementAPI from "../../ConnectAPI/MasterFood/Unit_of_Measurement";

export default function Ingredients() {
  // States
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Categories data
  const [units, setUnits] = useState<any[]>([]); // Units of measurement data
  const [newIngredient, setNewIngredient] = useState({ name: "", stock: "", category_id: "", unit_of_measurement_id: "" });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const toolbarOptions: ToolbarItems[] = ["Search", "ExcelExport"];
  const pageSettings = { pageSize: 10 };

  // Ref for the GridComponent
  const gridRef = useRef<GridComponent | null>(null);

  // Fetch ingredients, categories, and units from APIs
  const loadIngredients = async () => {
    try {
      const ingredientsResponse = await IngredientsAPI.getAll();
      setIngredients(ingredientsResponse.data);

      const categoriesResponse = await CategoryAPI.getAll();
      setCategories(categoriesResponse.data);

      const unitsResponse = await UnitOfMeasurementAPI.getAll();
      setUnits(unitsResponse.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load data.",
      });
    }
  };

  // Add a new ingredient
  const addIngredient = async () => {
    if (!newIngredient.name || !newIngredient.stock || !newIngredient.category_id || !newIngredient.unit_of_measurement_id) {
      Swal.fire({
        icon: "warning",
        title: "Alert",
        text: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await IngredientsAPI.add(newIngredient);
      setIngredients((prev) => [...prev, response.data]);
      setNewIngredient({ name: "", stock: "", category_id: "", unit_of_measurement_id: "" }); // Reset input
      setIsModalOpen(false); // Close modal
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Ingredient added successfully.",
      }).then(() => {
        loadIngredients(); // Ensure this runs after the success modal is shown
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add ingredient.",
      });
    }
  };

  // Toolbar click handler
  const toolbarClick = (args:any) => {
    if (args.item.id === "Grid_excelexport") {
      if (gridRef.current) {
        gridRef.current.excelExport(); // Trigger Excel Export
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadIngredients();
  }, []);

  return (
    <div className="p-4">
      {/* Page Header */}
      <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">ข้อมูลรายการวัถุดิบ</h1>

      {/* Add Ingredient Button */}
      <div className="flex justify-end mr-4 mb-4">
        <button
          onClick={() => setIsModalOpen(true)} // Open modal
          className="bg-purple-500 text-white py-2 px-4 rounded flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> เพิ่มรายการวัถุดิบ
        </button>
      </div>

      {/* Syncfusion Grid */}
      <GridComponent
        id="Grid"
        dataSource={ingredients}
        toolbar={toolbarOptions}
        allowPaging={true}
        pageSettings={pageSettings}
        toolbarClick={toolbarClick}
        allowExcelExport={true}
        ref={gridRef}
        width="100%"
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="id" width="100" textAlign="Center" />
          <ColumnDirective field="category.name" headerText="ประเภท" width="150" textAlign="Center" />
          <ColumnDirective field="name" headerText="ชื่อวัถุดิบ" width="150" textAlign="Center" />
          <ColumnDirective field="stock" headerText="คงคลัง" width="100" textAlign="Center" />
          <ColumnDirective field="unit_of_measurement.name" headerText="หน่วยวัด" width="150" textAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page, ExcelExport, Toolbar]} />
      </GridComponent>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-600">เพิ่มรายการวัถุดิบ</h2>
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 mt-4">ประเภท</label>
              <select
                value={newIngredient.category_id}
                onChange={(e) => setNewIngredient({ ...newIngredient, category_id: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">เลือกประเภท</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="block text-sm font-medium mb-2 mt-4">ชื่อวัถุดิบ</label>
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                placeholder="กรอกชื่อวัถุดิบ"
                className="border border-gray-300 p-2 rounded w-full"
              />
              <label className="block text-sm font-medium mb-2 mt-4">คงคลัง</label>
              <input
                type="number"
                value={newIngredient.stock}
                onChange={(e) => setNewIngredient({ ...newIngredient, stock: e.target.value })}
                placeholder="กรอกจำนวนคงคลัง"
                className="border border-gray-300 p-2 rounded w-full"
              />
              <label className="block text-sm font-medium mb-2 mt-4">หน่วยวัด</label>
              <select
                value={newIngredient.unit_of_measurement_id}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit_of_measurement_id: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">เลือกหน่วยวัด</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2"
              >
                ยกเลิก
              </button>
              <button
                onClick={addIngredient} // Call addIngredient
                className="bg-green-600 text-white py-2 px-4 rounded"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
