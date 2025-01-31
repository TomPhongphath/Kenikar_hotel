import RecipeAPI from "../../ConnectAPI/Recipe/Recipe";
import IngredientAPI from "../../ConnectAPI/MasterFood/Ingredients";
import { useState, useEffect, useRef } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, ExcelExport, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";
import Swal from "sweetalert2";

export default function NewRecipe() {
    const [recipe, setRecipe] = useState([]);
    const [newRecipe, setNewRecipe] = useState({ name: "", price: "" });
    const [newRecipeDetail, setNewRecipeDetail] = useState({
        recipe_id: "",
        ingredient_id: "",
        quantity: ""
    });
    const [tableRecipe, setTableRecipe] = useState<any[]>([])
    const [ingredient, setIngredient] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const toolbarOptions = ["Search", "ExcelExport"];
    const pageSettings = { pageSize: 10 };
    const gridRef = useRef<GridComponent | null>(null);

    // โหลดข้อมูล Recipes
    const loadRecipes = async () => {
        try {
            const response = await RecipeAPI.getAll();
            setRecipe(response.data);
            const ingredientResponse = await IngredientAPI.getAll();
            setIngredient(ingredientResponse.data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load Recipes.",
            });
        }
    };

    useEffect(() => {
        loadRecipes();
    }, []);

    const toolbarClick = (args: any) => {
        if (args.item.id === "Grid_excelexport") {
            if (gridRef.current) {
                gridRef.current.excelExport(); // Trigger Excel Export
            }
        }
    };

    const addRecipe = async () => {
        Swal.fire({
            title: "กำลังเพิ่มสูตรเมนูอาหาร...",
            text: "โปรดรอสักครู่",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        try {
            // ส่งข้อมูล Recipe ไปยัง Backend
            const recipeResponse = await RecipeAPI.add({
                name: newRecipe.name,
                price: newRecipe.price
            });

            const recipeId = recipeResponse.data.id; // ดึง id ของ recipe

            // ส่งข้อมูล ingredients ไปยัง API
            await Promise.all(
                tableRecipe.map(async (item) => {
                    const data = {
                        recipes_id: Number(recipeId),  // 🔹 แปลงเป็น Number ถ้า API ต้องการ
                        ingredient_id: Number(item.ingredient_id),  // 🔹 แปลงเป็น Number
                        quantity: Number(item.quantity),  // 🔹 แปลงเป็น Number
                    }

                    return RecipeAPI.addDetail(data);

                })
            );
            Swal.close();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Recipe added successfully!",
            });
            // รีโหลดข้อมูลใหม่
            setNewRecipeDetail({ recipe_id: "", ingredient_id: "", quantity: "" });
            setNewRecipe({ name: "", price: "" });
            setTableRecipe([]);
            loadRecipes();
            setIsModalOpen(false); // ปิด Modal
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to add Recipe.",
            });
        }
    };
    const handleAddRecipeDetail = () => {
        if (newRecipeDetail.ingredient_id && newRecipeDetail.quantity) {
            setTableRecipe([...tableRecipe, newRecipeDetail]);
            setNewRecipeDetail({ recipe_id: "", ingredient_id: "", quantity: "" }); // รีเซ็ตค่า input
        }
    };


    const cencel = () => {
        setNewRecipeDetail({ recipe_id: "", ingredient_id: "", quantity: "" });
        setTableRecipe([]);
        setNewRecipe({ name: "", price: "" });
        setIsModalOpen(false);
    };

    const handleViewDetails = async (id: number) => {
        try {
            // ✅ แสดง Swal โหลดข้อมูล
            Swal.fire({
                title: "กำลังโหลดข้อมูล...",
                text: "โปรดรอสักครู่",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await RecipeAPI.getById(id);

            if (!response.data) {
                throw new Error("API did not return any data");
            }

            const recipe = response.data.recipe;
            const recipedetails = response.data.recipedetails;

            const recipe_display = `<b>ชื่อเมนู:</b> ${recipe.name}<br>
                                    <b>ราคา:</b> ${recipe.price} บาท`;

            const recipedetails_display = recipedetails
                .map((item: any) => `• ${item.ingredient.name}: ${item.quantity}`)
                .join("<br>");

            // ✅ ปิด Loading และแสดงผลใน Swal
            Swal.fire({
                title: "รายละเอียดเมนู",
                html: `${recipe_display}<br><br><b>ส่วนประกอบ:</b><br>${recipedetails_display}`,
                confirmButtonText: "ปิด",
            });

        } catch (error) {
            console.error("❌ Error fetching recipe details:", error);

            // ❌ แสดง Swal แจ้งเตือนเมื่อเกิด Error
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด!",
                text: "ไม่สามารถโหลดรายละเอียดเมนูได้ โปรดลองใหม่อีกครั้ง",
            });
        }
    };


    return (
        <div className="p-4">
            <h1 className="text-lg font-bold text-white bg-green-600 p-4 rounded mb-4">เพิ่มสูตรเมนูอาหาร</h1>
            <div className="flex justify-end mr-4 mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-500 text-white py-2 px-4 rounded flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> เพิ่มสูตรเมนูอาหาร
                </button>
            </div>

            <GridComponent
                id="Grid"
                dataSource={recipe}
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
                    <ColumnDirective field="name" headerText="ชื่อเมนู" width="auto" textAlign="Center" />
                    <ColumnDirective field="price" headerText="ราคา" width="auto" textAlign="Center" />
                    <ColumnDirective
                        field="action"
                        headerText="ดูรายละเอียด"
                        width="150"
                        textAlign="Center"
                        template={(props: any) => (
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                                onClick={() => handleViewDetails(props.id)}
                            >
                                ดูรายละเอียด
                            </button>
                        )}
                    />
                </ColumnsDirective>
                <Inject services={[Page, ExcelExport, Toolbar]} />
            </GridComponent>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-2/5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-green-600">เพิ่มสูตรเมนูอาหาร</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">ชื่อ</label>
                            <input
                                type="text"
                                value={newRecipe.name}
                                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                                placeholder="กรอกชื่อเมนู"
                                className="border border-gray-300 p-2 rounded w-full mb-2"
                            />
                            <label className="block text-sm font-medium mb-2">ราคา</label>
                            <input
                                type="text"
                                value={newRecipe.price}
                                onChange={(e) => setNewRecipe({ ...newRecipe, price: e.target.value })}
                                placeholder="กรอกราคาเมนู"
                                className="border border-gray-300 p-2 rounded w-full mb-2"
                            />
                            <label className="block text-sm font-medium mb-2">รายละเอียดของสูตรอาหาร</label>
                            <form
                                className="flex gap-2 items-center"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddRecipeDetail();
                                }}
                            >
                                <select
                                    value={newRecipeDetail.ingredient_id}
                                    onChange={(e) => setNewRecipeDetail({ ...newRecipeDetail, ingredient_id: e.target.value })}
                                    className="border border-gray-300 p-2 rounded "
                                >
                                    <option value="">เลือกวัตถุดิบ</option>
                                    {ingredient.map((ingredientItem) => (
                                        <option key={ingredientItem.id} value={ingredientItem.id}>
                                            {ingredientItem.name}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    value={newRecipeDetail.quantity}
                                    onChange={(e) => setNewRecipeDetail({ ...newRecipeDetail, quantity: e.target.value })}
                                    placeholder="กรอกจำนวน"
                                    className="border border-gray-300 p-2 rounded "
                                />

                                <button
                                    type="submit"
                                    className="bg-green-600 text-white py-2 px-4 rounded"
                                >
                                    เพิ่ม
                                </button>
                            </form>
                            {/* แสดง Table */}
                            {tableRecipe.length > 0 && (
                                <table className="w-full border-collapse border border-gray-300 mt-4">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 px-4 py-2">#</th>
                                            <th className="border border-gray-300 px-4 py-2">วัตถุดิบ</th>
                                            <th className="border border-gray-300 px-4 py-2">จำนวน</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableRecipe.map((item, index) => (
                                            <tr key={index} className="text-center">
                                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    {ingredient.find((ing) => String(ing.id) === String(item?.ingredient_id))?.name || "ไม่พบข้อมูล"}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={cencel}
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={addRecipe}
                                className="bg-green-600 text-white py-2 px-4 rounded"
                            >
                                เพิ่มสูตรเมนูอาหาร
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
