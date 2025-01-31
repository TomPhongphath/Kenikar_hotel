import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import IngredientsAPI from "../../ConnectAPI/MasterFood/Ingredients";
import CategoryAPI from "../../ConnectAPI/MasterFood/Category";
import UnitOfMeasurementAPI from "../../ConnectAPI/MasterFood/Unit_of_Measurement";
import PurchaseDetailAPI from "../../ConnectAPI/Purchase/purchase_details";
import PurchaseAPI from "../../ConnectAPI/Purchase/purchases";

export default function NewPurchase() {
  const [categories, setCategories] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [addedIngredientIds, setAddedIngredientIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryResponse = await CategoryAPI.getAll();
        const ingredientResponse = await IngredientsAPI.getAll();
        const unitResponse = await UnitOfMeasurementAPI.getAll();

        setCategories(categoryResponse.data);
        setIngredients(ingredientResponse.data);
        setUnits(unitResponse.data);
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: "Failed to load data." });
      }
    };

    loadData();
  }, []);

  const handleCategorySearch = (e: any) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term) {
      const matchingCategory = categories.find((cat) => cat.name.toLowerCase().includes(term));
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
        setFilteredIngredients(ingredients.filter((ingredient) => ingredient.category_id === matchingCategory.id));
      } else {
        setSelectedCategory(null);
        setFilteredIngredients([]);
      }
    } else {
      setSelectedCategory(null);
      setFilteredIngredients([]);
    }
  };

  // 📌 ฟังก์ชันแปลงวันที่ (dd/mm/yyyy)
  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const addIngredientToTable = async (ingredient: any) => {
    if (addedIngredientIds.has(ingredient.id)) {
      Swal.fire({
        title: "เลือกวัตถุดิบนี้แล้ว",
        icon: "warning",
        text: "โปรดเลือกรายการวัตถุดิบอื่น",
        timer: 2000, // ตั้งเวลา 2 วินาที (2000 มิลลิวินาที)
        showConfirmButton: false // ซ่อนปุ่ม OK
      });
      return;
    }

    // ✅ แสดง SweetAlert2 (Loading) พร้อมไอคอนหมุน
    Swal.fire({
      title: "กำลังเพิ่มวัตถุดิบ...",
      text: "โปรดรอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });


    const categoryName = categories.find((cat) => cat.id === ingredient.category_id)?.name || "-";
    const unitName = units.find((unit) => unit.id === ingredient.unit_of_measurement_id)?.name || "-";
    const unitID = units.find((unit) => unit.id === ingredient.unit_of_measurement_id)?.id || "-";

    try {
      // เรียก API แบบ async และตรวจสอบว่ามีข้อมูลหรือไม่
      const ingredientPurchaseDetail = await PurchaseDetailAPI.getByingredient(ingredient.id);
      const purchaseData = ingredientPurchaseDetail?.data ?? null;

      if (!purchaseData) {
        console.warn(`No purchase detail found for ingredient ID: ${ingredient.id}`);
      }

      const newRow = {
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        category_name: categoryName,
        stock: ingredient.stock ?? 0,
        unit_of_measurement_name: unitName,
        unit_of_measurement_id: unitID,
        purchase_date: formatDate(purchaseData?.created_at) || "-",
        purchase_quantity: purchaseData?.quantity ?? 0,
        purchase_price: purchaseData?.price ?? 0,
        purchase_total: (purchaseData?.price ?? 0) * (purchaseData?.quantity ?? 0),
        quantity: 0,
        price: 0,
        total: 0,
        price_chang: 0,
        total_chang: 0
      };

      setTableData((prevData) => [...prevData, newRow]);
      setAddedIngredientIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.add(ingredient.id);
        return newIds;
      });
      Swal.close();
    } catch (error) {
      const newRow = {
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        category_name: categoryName,
        stock: ingredient.stock ?? 0,
        unit_of_measurement_name: unitName,
        unit_of_measurement_id: unitID,
        purchase_date: "-",
        purchase_quantity: "-",
        purchase_price: "-",
        purchase_total: "-",
        quantity: 0,
        price: 0,
        total: 0,
        price_chang: 0,
        total_chang: 0
      };
      setTableData((prevData) => [...prevData, newRow]);
      setAddedIngredientIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.add(ingredient.id);
        return newIds;
      });
      Swal.close();
    }
  };




  const removeIngredientFromTable = (index: any, ingredientId: any) => {
    setTableData((prevData) => prevData.filter((_, i) => i !== index));
    setAddedIngredientIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.delete(ingredientId);
      return newIds;
    });
  };


  const totalSum = tableData.reduce((sum, item) => sum + item.total, 0);


  const handleSubmit = async (event: any): Promise<void> => {
    event.preventDefault();

    let id_purchase: number | null = null;
    Swal.fire({
      title: "กำลังบันทึกข้อมูล...",
      text: "โปรดรอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      // เรียก API พร้อมส่ง totalSum
      const res = await PurchaseAPI.add({ total_price: totalSum });

      // ตรวจสอบว่ามีค่าที่ได้จาก API หรือไม่
      if (!res?.data?.id) {
        throw new Error("❌ API did not return a valid purchase ID.");
      }

      id_purchase = res.data.id;
      console.log("✅ Purchase successful, ID:", id_purchase);
    } catch (error) {
      console.error("❌ Error submitting purchase:", error);

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกการสั่งซื้อได้ โปรดลองอีกครั้ง",
      });

      return; // ออกจากฟังก์ชันทันที เพราะไม่สามารถดำเนินการต่อได้
    }

    setIsLoading(true);

    try {
      // ใช้ `Promise.allSettled()` เพื่อให้มั่นใจว่าทุก API จะถูกเรียก
      const results = await Promise.allSettled(
        tableData.map((row) =>
          PurchaseDetailAPI.add({
            ingredient_id: row.ingredient_id,
            unit_of_measurement_id: row.unit_of_measurement_id,
            price: row.price,
            quantity: row.quantity,
            purchase_id: id_purchase, // ใช้ ID ที่ได้จาก API
          })
        )
      );

      // ตรวจสอบว่ามี API ตัวไหนล้มเหลวหรือไม่
      const failedRequests = results.filter((result) => result.status === "rejected");

      if (failedRequests.length > 0) {
        console.error("❌ Some purchase details failed to save:", failedRequests);
        throw new Error(`❌ มี ${failedRequests.length} รายการที่บันทึกไม่สำเร็จ`);
      }
      Swal.close();
      // แจ้งเตือนเมื่อบันทึกสำเร็จ
      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "ข้อมูลการสั่งซื้อถูกบันทึกเรียบร้อยแล้ว!",
      });

      // ล้างข้อมูลหลังจากบันทึกสำเร็จ
      setTableData([]);
      setSearchTerm("");
      setSelectedCategory(null);
    } catch (error) {
      console.error("❌ Error:", error);

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลบางรายการได้ โปรดลองอีกครั้ง",
      });
    } finally {
      setIsLoading(false);
      setAddedIngredientIds(new Set()); // ล้างค่า ingredient IDs ที่เพิ่ม
    }
  };


  const calculateMaterialCostDetailed = (firstPurchase: any, secondPurchase: any) => {
    if (!firstPurchase || firstPurchase.quantity === 0 || firstPurchase.pricePerUnit === 0) {
      console.log("⚠️ First Purchase is 0 or undefined, returning '-'");
      return {
        firstTotal: 0,
        secondTotal: secondPurchase ? parseFloat((secondPurchase.pricePerUnit * secondPurchase.quantity).toFixed(2)) : 0,
        priceDifference: "-",
        extraCost: "-",
      };
    }

    const firstTotal = firstPurchase.pricePerUnit * firstPurchase.quantity;
    const secondTotal = secondPurchase.pricePerUnit * secondPurchase.quantity;

    // คำนวณ priceDifference และ extraCost
    const priceDifference = secondPurchase.pricePerUnit - firstPurchase.pricePerUnit;
    const extraCost = priceDifference * secondPurchase.quantity;

    // เพิ่มลูกศรตามเงื่อนไข
    const formatValue = (value: number) =>
      value > 0 ? `↑${value.toLocaleString()}` : value < 0 ? `↓${Math.abs(value).toLocaleString()}` : "0";

    return {
      firstTotal: parseFloat(firstTotal.toFixed(2)),
      secondTotal: parseFloat(secondTotal.toFixed(2)),
      priceDifference: formatValue(priceDifference),
      extraCost: formatValue(extraCost),
    };
  };



  const handleChange = (index: any, field: any, value: any) => {
    const newData = [...tableData];
    let newValue = value;

    if (field === "quantity" || field === "price") {
      newValue = String(value).replace(/^0+/, "") || "0";
    }

    newData[index][field] = newValue;
    newData[index].total = (parseFloat(newData[index].quantity) || 0) * (parseFloat(newData[index].price) || 0);

    const firstPurchase = {
      pricePerUnit: parseFloat(newData[index].purchase_price) || 0,
      quantity: parseFloat(newData[index].purchase_quantity) || 0,
    };

    const secondPurchase = {
      pricePerUnit: parseFloat(newData[index].price) || 0,
      quantity: parseFloat(newData[index].quantity) || 0,
    };

    const result = calculateMaterialCostDetailed(firstPurchase, secondPurchase);
    newData[index].price_chang = result.priceDifference;
    newData[index].total_chang = result.extraCost;

    setTableData(newData);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">เพิ่มรายการการสั่งซื้อ</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">ค้นหาหมวดหมู่อาหาร</label>
        <input type="text" value={searchTerm} onChange={handleCategorySearch} placeholder="ค้นหาหมวดหมู่อาหาร" className="border border-gray-300 p-2 rounded w-full" />
      </div>
      {selectedCategory && (
        <div className="mb-4">
          <h2 className="text-md font-bold mb-2">วัตถุดิบในหมวดหมู่: {selectedCategory.name}</h2>
          <div className="grid grid-cols-8 gap-2">
            {filteredIngredients.map((ingredient) => (
              <button key={ingredient.id} className="border p-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => addIngredientToTable(ingredient)}>
                {ingredient.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit}>
        <h2 className="text-md font-bold mb-4">รายการการสั่งซื้อ</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th rowSpan={2} className="border px-4 py-2">หมวดหมู่</th>
              <th rowSpan={2} className="border px-4 py-2">วัตถุดิบ</th>
              <th rowSpan={2} className="border px-4 py-2">คงคลัง</th>
              <th rowSpan={2} className="border px-4 py-2">หน่วยวัด</th>
              <th colSpan={4} className="border px-4 py-2 bg-lime-400 text-center font-bold">
                สั่งซื้อล่าสุด
              </th>
              <th colSpan={3} className="border px-4 py-2 bg-teal-300 text-center font-bold">
                สั่งซื้อ
              </th>
              <th colSpan={3} className="border px-4 py-2 bg-amber-300 text-center font-bold">
                ค่าเปลี่ยนแปลง
              </th>
            </tr>
            <tr>
              <th className="border px-4 py-2 bg-lime-200">วันที่</th>
              <th className="border px-4 py-2 bg-lime-200">จำนวน</th>
              <th className="border px-4 py-2 bg-lime-200">ราคา</th>
              <th className="border px-4 py-2 bg-lime-200">รวม</th>
              <th className="border px-4 py-2 bg-teal-200">จำนวน</th>
              <th className="border px-4 py-2 bg-teal-200">ราคา</th>
              <th className="border px-4 py-2 bg-teal-200">รวม</th>
              <th className="border px-4 py-2 bg-amber-200">ราคา</th>
              <th className="border px-4 py-2 bg-amber-200">รวม</th>
              <th className="border px-4 py-2 bg-amber-200">ลบ</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, index) => (
              <tr className="text-center" key={index}>
                <td className="border px-4 py-2 bg-neutral-100">{row.category_name}</td>
                <td className="border px-4 py-2 bg-neutral-100">{row.ingredient_name}</td>
                <td className="border px-4 py-2 bg-neutral-100">{row.stock}</td>
                <td className="border px-4 py-2 bg-neutral-100">{row.unit_of_measurement_name}</td>
                <td className="border px-4 py-2 bg-lime-100">{row.purchase_date}</td>
                <td className="border px-4 py-2 bg-lime-100">{row.purchase_quantity}</td>
                <td className="border px-4 py-2 bg-lime-100">{row.purchase_price}</td>
                <td className="border px-4 py-2 font-bold bg-lime-100">{row.purchase_total.toLocaleString()}</td>
                <td className="border bg-teal-100">
                  <input type="number" value={row.quantity} onChange={(e) => handleChange(index, "quantity", Number(e.target.value))} className="w-20 border border-gray-300 px-2 text-center" />
                </td>
                <td className="border bg-teal-100">
                  <input type="number" value={row.price} onChange={(e) => handleChange(index, "price", Number(e.target.value))} className="w-20 border border-gray-300 px-2 text-center" />
                </td>
                <td className="border px-4 py-2 font-bold bg-teal-100">{row.total.toLocaleString()}</td>
                <td className="border px-4 py-2 font-bold bg-lime-100">{row.price_chang}</td>
                <td className="border px-4 py-2 font-bold bg-lime-100">{row.total_chang}</td>
                <td className="border px-4 py-2 bg-amber-100">
                  <button type="button" className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => removeIngredientFromTable(index, row.ingredient_id)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.length > 0 && (
          <div className="mt-4">
            <div className="flex ">ราคารวมของรายการการสั่งซื้อ <div className="font-bold px-2">{totalSum.toLocaleString()}</div> บาท</div>
            <button
              type="submit"
              className={`mt-2 px-4 py-2 rounded ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"}`}
              disabled={isLoading}
            >
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
