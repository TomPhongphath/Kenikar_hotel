import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { GridComponent, ColumnsDirective, ColumnDirective, ExcelExport, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";
import { ToolbarItems } from "@syncfusion/ej2-react-grids";
import UnitOfMeasurementAPI from "../../ConnectAPI/MasterFood/Unit_of_Measurement";

export default function UnitOfMeasurement() {
  // States
  const [units, setUnits] = useState<any[]>([]);
  const [newUnit, setNewUnit] = useState({ name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const toolbarOptions: ToolbarItems[] = ["Search", "ExcelExport"];
  const pageSettings = { pageSize: 10 };

  // Ref for the GridComponent
  const gridRef = useRef<GridComponent | null>(null);

  // Fetch units from API
  const loadUnits = async () => {
    try {
      const response = await UnitOfMeasurementAPI.getAll();
      setUnits(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load units of measurement.",
      });
    }
  };

  // Add a new unit
  const addUnit = async () => {
    if (!newUnit.name) {
      Swal.fire({
        icon: "warning",
        title: "Alert",
        text: "Please enter a unit of measurement name.",
      });
      return;
    }

    try {
      const response = await UnitOfMeasurementAPI.add(newUnit);
      setUnits((prev) => [...prev, response.data]);
      setNewUnit({ name: "" }); // Reset input
      setIsModalOpen(false); // Close modal
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Unit of measurement added successfully.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add unit of measurement.",
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

  // Load units on component mount
  useEffect(() => {
    loadUnits();
  }, []);

  return (
    <div className="p-4">
      {/* Page Header */}
      <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">ข้อมูลหน่วยวัด</h1>

      {/* Add Unit Button */}
      <div className="flex justify-end mr-4 mb-4">
        <button
          onClick={() => setIsModalOpen(true)} // Open modal
          className="bg-purple-500 text-white py-2 px-4 rounded flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> เพิ่มหน่วยวัด
        </button>
      </div>

      {/* Syncfusion Grid */}
      <GridComponent
        id="Grid"
        dataSource={units}
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
          <ColumnDirective field="name" headerText="หน่วยวัด" width="auto" textAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page, ExcelExport, Toolbar]} />
      </GridComponent>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-600">เพิ่มหน่วยวัด</h2>
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">หน่วยวัด</label>
              <input
                type="text"
                value={newUnit.name}
                onChange={(e) => setNewUnit({ name: e.target.value })}
                placeholder="กรอกหน่วยวัด"
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
                onClick={addUnit} // Call addUnit
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
