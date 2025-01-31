import { useState, useEffect, useRef } from 'react'
import PurchaseAPI from '../../ConnectAPI/Purchase/purchases';
import PurchaseDetailAPI from '../../ConnectAPI/Purchase/purchase_details';
import IngredientAPI from '../../ConnectAPI/MasterFood/Ingredients';
import Swal from "sweetalert2";
import { GridComponent, ColumnsDirective, ColumnDirective, ExcelExport, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";

export default function ApprovPurchase() {
  const [purchaseData, setPurchaseData] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [idPurchase, setIdPurchase] = useState<any | null>(null);
  const [dataPurchase, setDataPurchase] = useState<any | null>(null);
  const gridRef = useRef<GridComponent | null>(null);
  useEffect(() => {
    // ดึงข้อมูลจาก API (จำลอง)
    async function fetchData() {
      try {
        const response = await PurchaseAPI.getAll(); // เรียก API
        if (response) {
          setPurchaseData(response);

          // คำนวณราคารวมของแต่ละรายการ และรวมยอดทั้งหมด
        }
      } catch (error) {
        Swal.fire("Error", "ไม่สามารถโหลดข้อมูลได้", "error");
      }
    }

    fetchData();
  }, []);

  const toolbarOptions = ['ExcelExport', 'Search'];

  const toolbarClick = (args: any) => {
    if (args.item.id === "Grid_excelexport") {
      if (gridRef.current) {
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}/${now.getHours()}/${now.getMinutes()}`;

        let exportProperties = {
          fileName: `ประวัติการสั่งซื้อ ${formattedDate}.xlsx`,
          dataSource: purchaseData?.data?.map((item: any) => ({
            id: item.id,
            approve_status: item.approve_status === "pending" ? "รออนุมัติ" :
              item.approve_status === "rejected" ? "ปฏิเสธการอนุมัติ" :
                item.approve_status === "approved" ? "อนุมัติแล้ว" : "ไม่ระบุ",
            created_at: new Date(item.created_at).toLocaleString("th-TH"),
            purchase_details: item.purchase_details ? item.purchase_details.length : 0,
            total_price: parseFloat(item.total_price).toLocaleString()
          }))
        };

        gridRef.current.excelExport(exportProperties); // Export ข้อมูลใหม่ที่ถูกแปลง
      }
    }
  };

  // const totalPrice = (dataPurchase?.length ?? 0) > 0
  //   ? dataPurchase.reduce((acc, item) => acc + item.quantity * parseFloat(item.price), 0)
  //   : 0;

  const itemsPerPage = 15; // รายการต่อหน้า
  const totalPages = Math.ceil((dataPurchase ?? []).length / itemsPerPage);


  const openPopup = async (id: any, date: any, approve_status: any) => {
    Swal.fire({
      title: "กำลังโหลดข้อมูล...",
      text: "โปรดรอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await PurchaseDetailAPI.getByPurchaseId(id);
      const statusText = approve_status === "pending" ? "รออนุมัติ" :
        approve_status === "rejected" ? "ปฏิเสธการอนุมัติ" :
          approve_status === "approved" ? "อนุมัติแล้ว" : "ไม่ระบุ";
      setIdPurchase({
        id,
        date: new Date(date).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        approve_status: statusText
      });

      const dataPo = response.data;

      async function fetchIngredients() {
        const results = await Promise.all(
          dataPo.map((index: any) => IngredientAPI.getById(index.ingredient_id))
        );

        // อัปเดตค่า ingredient_id และ unit_of_measurement_id ของ dataPo
        return dataPo.map((item: any, idx: any) => ({
          ...item,
          ingredient_id: results[idx].data.name,  // แทนที่ ingredient_id ด้วยชื่อวัตถุดิบ
          unit_of_measurement_id: results[idx].data.unit_of_measurement.name, // แทนที่ unit_of_measurement_id ด้วยชื่อหน่วยวัด
        }));
      }

      // ✅ รอให้ข้อมูลถูกโหลดก่อนใช้
      const poData = await fetchIngredients();


      setDataPurchase(poData);
      setIsModalOpen(true);
      Swal.close();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะโหลดข้อมูล:", error);

      // ❌ แจ้งเตือนเมื่อเกิด Error
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถโหลดข้อมูลได้ โปรดลองใหม่",
      });
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">อนุมัติการสั่งซื้อ For Admin</h1>
      {purchaseData ? (
        <>
          <GridComponent dataSource={purchaseData.data}
            allowPaging={true}
            toolbar={toolbarOptions}
            allowExcelExport={true}
            toolbarClick={toolbarClick}
            id="Grid"
            ref={gridRef}>
            <ColumnsDirective>

              <ColumnDirective
                field="approve_status"
                headerText="สถานะอนุมัติการสั่งซื้อ"
                width="150"
                textAlign="Center"
                template={(props: any) => {
                  switch (props.approve_status) {
                    case "pending":
                      return <span className="text-yellow-500 font-bold">รออนุมัติ</span>;
                    case "rejected":
                      return <span className="text-red-500 font-bold">ปฎิเสธการอนุมัติ</span>;
                    case "approved":
                      return <span className="text-green-500 font-bold">อนุมัติแล้ว</span>;
                    default:
                      return <span className="text-gray-500">ไม่ระบุ</span>;
                  }
                }}
              />
              <ColumnDirective field="id" headerText="เลขลำดับการสั่งซื้อ" width="100" textAlign="Center" />
              <ColumnDirective
                field="created_at"
                headerText="วันที่สั่งซื้อ"
                width="180"
                textAlign="Center"
                template={(props: any) => {
                  if (!props.created_at) return "ไม่ระบุ";

                  const date = new Date(props.created_at);
                  return date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  });
                }}
              />

              <ColumnDirective
                field="purchase_details"
                headerText="จำนวนรายการที่สั่งซื้อ"
                width="150"
                textAlign="Center"
                template={(props: any) => {
                  return props.purchase_details ? props.purchase_details.length : 0;
                }}
              />
              <ColumnDirective
                field="total_price"
                headerText="จำนวนเงิน"
                width="140"
                textAlign="Center"
                template={(props: any) => {
                  if (!props.total_price) return "0 บาท";

                  return `${parseFloat(props.total_price).toLocaleString()} บาท`;
                }}
              />
              <ColumnDirective
                field="action"
                headerText="เลือกการสั่งซื้อ"
                width="120"
                textAlign="Center"
                template={(props: any) => (
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                    onClick={() => openPopup(props.id, props.created_at, props.approve_status)}
                  >...
                  </button>
                )}
              />
            </ColumnsDirective>
            <Inject services={[Page, Toolbar, ExcelExport]} />
          </GridComponent>
        </>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
          <div className="bg-white p-6 rounded shadow-lg w-2/3 h-3/4 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-600 text-center w-full">
                อนุมัติการสั่งซื้อ
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-grow overflow-y-auto p-4">
              {Array.from({ length: totalPages }, (_, pageIndex) => {
                const start = pageIndex * itemsPerPage;
                const end = Math.min(start + itemsPerPage, dataPurchase.length);
                const currentPageItems = dataPurchase.slice(start, end);
                const totalOverallPrice = dataPurchase.reduce((acc: any, item: any) => acc + item.quantity * parseFloat(item.price), 0);

                return (
                  <div key={pageIndex} className="w-[210mm] h-[297mm] mx-auto p-8 bg-white border border-black text-sm print:w-full print:h-full mb-4 flex flex-col">
                    {/* หัวใบ PO */}
                    <div>
                      <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">ใบสั่งซื้อวัตถุดิบอาหาร (Food Purchase Order - PO)</h1>
                      </div>

                      {/* ข้อมูลโรงแรม & ผู้ขาย */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-gray-700">
                        <div>
                          <h2 className="font-bold">ข้อมูลโรงแรม (Hotel Information)</h2>
                          <p>โรงแรม XYZ กรุงเทพฯ</p>
                          <p>789 หมู่ 5 ถนนพระราม 4 กรุงเทพฯ 10330</p>
                          <p>โทร: 02-555-6789 | อีเมล: purchase@hotelxyz.com</p>
                        </div>
                        <div>
                          <h2 className="font-bold">ข้อมูลซัพพลายเออร์ (Supplier Information)</h2>
                          <p>บริษัท วัตถุดิบอาหาร จำกัด</p>
                          <p>99/1 ถนนสาทรเหนือ กรุงเทพฯ 10120</p>
                          <p>โทร: 02-999-1234 | อีเมล: sales@foodsupplier.com</p>
                        </div>
                      </div>

                      {/* รายละเอียดใบสั่งซื้อ */}
                      <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 mb-4">
                        <p><strong>เลขที่ใบสั่งซื้อ (PO Number):</strong> {idPurchase.id}</p>
                        <p><strong>วันที่สั่งซื้อ:</strong> {idPurchase.date}</p>
                        <p><strong>สถานะการสั่งซื้อ:</strong> {idPurchase.approve_status}</p>
                      </div>
                    </div>

                    {/* ตารางสินค้าเต็มหน้า */}
                    <div className="flex-grow overflow-hidden">
                      <div className="overflow-x-auto border border-gray-300 rounded-lg h-full">
                        <table className="w-full border-collapse border border-gray-300 h-full">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="border border-gray-400 px-2 py-1">ลำดับ</th>
                              <th className="border border-gray-400 px-2 py-1">ชื่อวัตถุดิบ</th>
                              <th className="border border-gray-400 px-2 py-1">จำนวน</th>
                              <th className="border border-gray-400 px-2 py-1">หน่วย</th>
                              <th className="border border-gray-400 px-2 py-1">ราคาต่อหน่วย</th>
                              <th className="border border-gray-400 px-2 py-1">รวม</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPageItems.map((item: any, i: any) => (
                              <tr key={i} className="bg-white hover:bg-gray-100">
                                <td className="border border-gray-300 px-2 py-1 text-center">{start + i + 1}</td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{item.ingredient_id}</td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{item.quantity.toLocaleString()}</td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{item.unit_of_measurement_id}</td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{parseFloat(item.price).toLocaleString()} บาท</td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{(item.quantity * parseFloat(item.price)).toLocaleString()} บาท</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* หมายเหตุ, ยอดรวมทั้งหมด และ ลายเซ็น (เฉพาะหน้าสุดท้าย) */}
                    {pageIndex === totalPages - 1 && (
                      <div>
                        {/* รวมยอดทั้งหมดของทุกหน้า */}
                        <div className="text-right mt-4">
                          <p className="text-xl font-bold text-gray-900 border-t border-gray-400 pt-2">รวมทั้งหมดของทุกหน้า: {totalOverallPrice.toLocaleString()} บาท</p>
                        </div>

                        {/* หมายเหตุ */}
                        <div className="border-black border p-3 bg-gray-50 mt-6">
                          <h2 className="font-bold">หมายเหตุ</h2>
                          <p>- วัตถุดิบต้องสดใหม่ และผ่านมาตรฐาน GMP หรือ HACCP</p>
                          <p>- ส่งมอบสินค้าภายในเวลาที่กำหนด หากล่าช้าอาจมีค่าปรับ</p>
                          <p>- โรงแรมขอสงวนสิทธิ์ในการตรวจสอบคุณภาพก่อนรับสินค้า</p>
                        </div>

                        {/* ลายเซ็น */}
                        <div className="grid grid-cols-3 gap-4 text-center mt-8">
                          <div>
                            <p className="font-semibold">......................................</p>
                            <p>ผู้จัดซื้อ</p>
                            <p>(Purchasing Officer)</p>
                            <p>(________________)</p>
                          </div>
                          <div>
                            <p className="font-semibold">......................................</p>
                            <p>ผู้อนุมัติ</p>
                            <p>(Hotel Manager)</p>
                            <p>(________________)</p>
                          </div>
                          <div>
                            <p className="font-semibold">......................................</p>
                            <p>ตัวแทนซัพพลายเออร์</p>
                            <p>(Supplier Representative)</p>
                            <p>(________________)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* หมายเลขหน้า */}
                    <div className="text-center text-gray-500 mt-4">
                      <p>หน้า {pageIndex + 1} / {totalPages}</p>
                    </div>
                  </div>
                );
              })}


            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-4 p-4">
              {/* ปุ่มอนุมัติ และ ปฏิเสธอนุมัติ (แสดงเฉพาะเมื่อ "รออนุมัติ") */}
              {idPurchase?.approve_status === "รออนุมัติ" ? (
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white py-2 px-4 rounded">
                    อนุมัติ
                  </button>
                  <button className="bg-red-600 text-white py-2 px-4 rounded">
                    ปฏิเสธอนุมัติ
                  </button>
                </div>
              ) : (
                <div></div> // เพื่อรักษาตำแหน่ง "ยกเลิก" ทางขวา
              )}

              {/* ปุ่มยกเลิก (อยู่ขวาเสมอ) */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
              >
                ยกเลิก
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  )
}
