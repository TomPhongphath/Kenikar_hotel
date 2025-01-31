import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const location = useLocation();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isRecipeOpen,setIsRecipeOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/Purchase")) {
      setIsPurchaseOpen(true);
    } else {
      setIsPurchaseOpen(false);
    }

    if (location.pathname.startsWith("/MasterFood")) {
      setIsMaterialOpen(true);
    } else {
      setIsMaterialOpen(false);
    }
  }, [location]);

  return (
    <div className="flex flex-col h-screen w-56 bg-white border border-gray-300 shadow-lg fixed">
      {/* Header */}
      <div className="flex flex-col items-center py-6 border-b border-gray-300">
        <img
          src="https://www.kenikarraintreeresidencehotel.com/images/logo/Logo.png"
          alt="Logo"
          className="w-20 h-20 rounded-full"
        />
        <h3 className="mt-3 text-lg font-semibold text-gray-800">Steave Jobs</h3>
        <p className="text-sm text-gray-500">steve@gmail.com</p>
      </div>

      {/* Menu */}
      <ul className="mt-6 space-y-4 px-4">
        {/* หน้าหลัก */}
        {/* <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            หน้าหลัก
          </NavLink>
        </li> */}

                {/* สูตรอาหาร Dropdown */}
                <li>
          <div
            className="cursor-pointer block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setIsRecipeOpen(!isRecipeOpen)}
          >
            สูตรเมนูอาหาร
          </div>
          {isRecipeOpen && (
            <ul className="ml-4 space-y-2">
              <li>
                <NavLink
                  to="/Recipe/New"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  เพิ่มสูตรเมนูอาหาร
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* ข้อมูลการสั่งซื้อ Dropdown */}
        <li>
          <div
            className="cursor-pointer block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setIsPurchaseOpen(!isPurchaseOpen)}
          >
            ข้อมูลการสั่งซื้อ
          </div>
          {isPurchaseOpen && (
            <ul className="ml-4 space-y-2">
              <li>
                <NavLink
                  to="/Purchase/New"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  ข้อมูลการสั่งซื้อใหม่
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Purchase/History"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  ข้อมูลประวัติการสั่งซื้อ
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Purchase/Approve"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  ข้อมูลอนุมัติการสั่งซื้อ
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* ข้อมูลวัตถุดิบ Dropdown */}
        <li>
          <div
            className="cursor-pointer block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMaterialOpen(!isMaterialOpen)}
          >
            ข้อมูลวัตถุดิบ
          </div>
          {isMaterialOpen && (
            <ul className="ml-4 space-y-2">
              <li>
                <NavLink
                  to="/MasterFood/Category"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  ข้อมูลหมวดอาหาร
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/MasterFood/Ingredients"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  ข้อมูลรายการวัตถุดิบ
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/MasterFood/Unit_of_Measurement"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  ข้อมูลหน่วยมาตรวัดปริมาณ
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
