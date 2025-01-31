<?php

namespace App\Http\Controllers;

use App\Models\PurchaseDetail;
use Illuminate\Http\Request;

class PurchaseDetailController extends Controller
{
    /**
     * Get all purchase details.
     */
    public function index()
    {
        $purchase_details = PurchaseDetail::with(['ingredient', 'unit_of_measurement'])->get();  
        return response()->json($purchase_details);
    }

    /**
     * Add new purchase detail.
     */
    public function add(Request $request) 
    {
        try {
            // ตรวจสอบข้อมูลที่รับเข้ามา
            $request->validate([
                'ingredient_id' => 'required|exists:ingredients,id',
                'unit_of_measurement_id' => 'required|exists:unit_of_measurements,id',
                'price' => 'required|integer',
                'quantity' => 'required|integer',
                'purchase_id' => 'required|exists:purchases,id'
            ]);

            $purchase_detail = PurchaseDetail::create([
                'ingredient_id' => $request->ingredient_id,
                'unit_of_measurement_id' => $request->unit_of_measurement_id,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'purchase_id' => $request->purchase_id
            ]);
    
            return response()->json([
                'message' => "{$purchase_detail->id} added successfully",
                'purchase_detail' => $purchase_detail->load(['ingredient', 'unit_of_measurement']) 
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation Error',
                'messages' => $e->errors()
            ], 422);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Something went wrong',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function searchByIngredient($id) 
    {
        // ค้นหารายการล่าสุดของ ingredient_id ที่ตรงกับค่า $id
        $latestPurchaseDetail = PurchaseDetail::where('ingredient_id', $id)
            ->latest() // เรียงลำดับจากใหม่ไปเก่า
            ->first(); // ดึงเฉพาะแถวแรก (ล่าสุด)
    
        // ถ้าไม่พบข้อมูล ให้ส่ง response กลับไปพร้อมสถานะ 404
        if (!$latestPurchaseDetail) {
            return response()->json(['message' => 'No ingredient_id found'], 404);
        }
    
        // ถ้าพบข้อมูล ให้ส่ง response กลับไปพร้อมสถานะ 200
        return response()->json($latestPurchaseDetail, 200);
    }
    
    public function searchByPurchaseId($id){
        $purchase_po = PurchaseDetail::where('purchase_id', $id)->orderBy('created_at', 'desc')->get(); 
        if (!$purchase_po) {
            return response()->json(['message' => 'No ingredient_id found'], 404);
        }
    
        // ถ้าพบข้อมูล ให้ส่ง response กลับไปพร้อมสถานะ 200
        return response()->json($purchase_po, 200);
    }
}
