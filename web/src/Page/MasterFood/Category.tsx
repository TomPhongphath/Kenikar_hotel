import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { GridComponent, ColumnsDirective, ColumnDirective, ExcelExport, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";
import { ToolbarItems } from "@syncfusion/ej2-react-grids";
import CategoryAPI from "../../ConnectAPI/MasterFood/Category";

export default function Category() {
  // States
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const toolbarOptions: ToolbarItems[] = ["Search", "ExcelExport"];
  const pageSettings = { pageSize: 10 };

  // Ref for the GridComponent
  const gridRef = useRef<GridComponent | null>(null);

  // Fetch categories from API
  const loadCategories = async () => {
    try {
      const response = await CategoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load categories.",
      });
    }
  };

  // Add a new category
  const addCategory = async () => {
    if (!newCategory.name) {
      Swal.fire({
        icon: "warning",
        title: "Alert",
        text: "Please enter a category name.",
      });
      return;
    }

    try {
      const response = await CategoryAPI.add(newCategory);
      setCategories((prev) => [...prev, response.data]);
      setNewCategory({ name: "" }); // Reset input
      setIsModalOpen(false); // Close modal
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Category added successfully.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add category.",
      });
    }
  };

  // Toolbar click handler
  const toolbarClick = (args: any) => {
    if (args.item.id === "Grid_excelexport") {
      if (gridRef.current) {
        gridRef.current.excelExport(); // Trigger Excel Export
      }
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="p-4">
      {/* Page Header */}
      <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">ข้อมูลหมวดอาหาร</h1>

      {/* Add Category Button */}
      <div className="flex justify-end mr-4 mb-4">
        <button
          onClick={() => setIsModalOpen(true)} // Open modal
          className="bg-purple-500 text-white py-2 px-4 rounded flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> เพิ่มหมวดอาหาร
        </button>
      </div>

      {/* Syncfusion Grid */}
      <GridComponent
        id="Grid"
        dataSource={categories}
        toolbar={toolbarOptions}
        allowPaging={true}
        pageSettings={pageSettings}
        toolbarClick={toolbarClick}
        allowExcelExport={true}
        ref={gridRef}
        width="100%"
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="ลำดับ" width="auto" textAlign="Center" />
          <ColumnDirective field="name" headerText="หมวดอาหาร" width="auto" textAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page, ExcelExport, Toolbar]} />
      </GridComponent>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-600">เพิ่มหมวดอาหาร</h2>
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">หมวดอาหาร</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ name: e.target.value })}
                placeholder="กรอกหมวดอาหาร"
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2"
              >
                ยกเลิก
              </button>
              <button
                onClick={addCategory} // Call addCategory
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
