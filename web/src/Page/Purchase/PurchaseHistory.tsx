import { useState, useEffect, useRef } from 'react';
import PurchaseAPI from '../../ConnectAPI/Purchase/purchases';
import Swal from "sweetalert2";
import { GridComponent, ColumnsDirective, ColumnDirective, ExcelExport, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";

function PurchaseHistory() {
  const [purchaseData, setPurchaseData] = useState<any|null>(null);
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

  const toolbarClick = (args:any) => {
    if (args.item.id === "Grid_excelexport") {
      if (gridRef.current) {
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}/${now.getHours()}/${now.getMinutes()}`;
  
        let exportProperties = {
          fileName: `ประวัติการสั่งซื้อ ${formattedDate}.xlsx`,
          dataSource: purchaseData.data.map((item:any) => ({
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
  

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">ประวัติการสั่งซื้อ</h1>

      {purchaseData ? (
        <>
          <GridComponent dataSource={purchaseData.data}
            allowPaging={true}
            toolbar={toolbarOptions}
            allowExcelExport={true}
            toolbarClick={toolbarClick}
            id="Grid"
            ref={gridRef}>
            <ColumnsDirective

            >
              <ColumnDirective
                field="approve_status"
                headerText="สถานะอนุมัติการสั่งซื้อ"
                width="150"
                textAlign="Center"
                template={(props:any) => {
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
                template={(props:any) => {
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
                template={(props:any) => {
                  return props.purchase_details ? props.purchase_details.length : 0;
                }}
              />
              <ColumnDirective
                field="total_price"
                headerText="จำนวนเงิน"
                width="140"
                textAlign="Center"
                template={(props:any) => {
                  if (!props.total_price) return "0 บาท";

                  return `${parseFloat(props.total_price).toLocaleString()} บาท`;
                }}
              />

            </ColumnsDirective>
            <Inject services={[Page, Toolbar, ExcelExport]} />
          </GridComponent>
        </>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
}

export default PurchaseHistory;
