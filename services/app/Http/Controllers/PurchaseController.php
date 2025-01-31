<?php

namespace App\Http\Controllers;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Ingredient;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchase = Purchase::with(['purchaseDetails'])->orderBy('created_at', 'desc')->get();  
        return response()->json($purchase);
    }

    public function add(Request $request) {
        try {
            // ตรวจสอบข้อมูลที่รับเข้ามา
            $request->validate([
                'total_price' => 'required|integer',
            ]);
            $purchase = Purchase::create([
                'total_price' => $request->total_price,
                'approve_status' => 'pending' // approved / unapprove / pending
            ]);
    
            return response()->json([
                'id' => $purchase->id,
                'message' => "Added successfully",
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
    
    public function searchByApproveStatus(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'approve_status' => 'required|string|in:approved,rejected',
        ]);
    
        $id = $request->id;
        $approve_status = $request->approve_status;
    
        $purchase = Purchase::find($id);
    
        // ✅ ตรวจสอบว่าพบ Purchase จริงหรือไม่
        if (!$purchase) {
            return response()->json([
                'error' => 'Purchase not found',
                'message' => "No purchase record found for ID: $id"
            ], 404);
        }
    
        if ($approve_status === 'rejected') {
            $purchase->update(['approve_status' => $approve_status]);
    
            return response()->json([
                'message' => "Purchase ID: {$id} has been rejected successfully",
                'purchase' => $purchase
            ], 200);
        } 
    
        if ($approve_status === 'approved') {
            // ✅ ค้นหา PurchaseDetail ตาม purchase_id
            $purchaseDetails = PurchaseDetail::where('purchase_id', $id)->get();
        
            // ✅ ตรวจสอบว่าพบ PurchaseDetail หรือไม่
            if ($purchaseDetails->isEmpty()) {
                return response()->json([
                    'error' => 'PurchaseDetail not found',
                    'message' => "No purchase detail record found for purchase_id: $id"
                ], 404);
            }
        
            // ✅ อัปเดต Stock ของ Ingredient ตามรายการที่เกี่ยวข้อง
            foreach ($purchaseDetails as $purchaseDetail) {
                $ingredient = Ingredient::find($purchaseDetail->ingredient_id);
        
                if ($ingredient) {
                    $ingredient->stock += $purchaseDetail->quantity; // อัปเดต stock
                    $ingredient->save();
                } else {
                    return response()->json([
                        'error' => "Ingredient not found",
                        'message' => "Ingredient ID {$purchaseDetail->ingredient_id} not found"
                    ], 404);
                }
            }
        
            // ✅ อัปเดต approve_status เป็น approved
            $purchase->update(['approve_status' => $approve_status]);
        
            return response()->json([
                'message' => "Purchase ID: {$id} has been approved and stock updated",
                'purchase' => $purchase,
                'updated_ingredients' => $purchaseDetails->pluck('ingredient_id')
            ], 200);
        }
        
        
    
        return response()->json([
            'error' => 'Invalid status',
            'message' => "Invalid approve_status provided: {$approve_status}"
        ], 400);
    }

    public function searchById($id)
    {
        $purchase = Purchase::with(['purchaseDetails'])->find($id);

        if (!$purchase) {
            return response()->json(['message' => 'purchase not found'], 404);
        }

        return response()->json($purchase, 200);
    }

    }
