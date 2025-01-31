<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\UnitOfMeasurementController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseDetailController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\RecipeDetailController;
use Illuminate\Support\Facades\Route;

// Category Routes (Grouped under 'categories')
Route::prefix('categories')->group(function () {
    Route::post('/', [CategoryController::class, 'add']);  // Add a new category
    Route::delete('/{id}', [CategoryController::class, 'delete']);  // Delete a category by ID
    Route::put('/{id}', [CategoryController::class, 'update']);  // Update a category by ID
    Route::get('/{id}', [CategoryController::class, 'searchById']);  // Search category by ID
    Route::get('/name/{name}', [CategoryController::class, 'searchByName']);  // Search category by name
    Route::get('/', [CategoryController::class, 'index']);  // Show all categories
});

// Ingredient Routes (Grouped under 'ingredients')
Route::prefix('ingredients')->group(function () {
    Route::post('/', [IngredientController::class, 'add']);  // Add a new ingredient
    Route::delete('/{id}', [IngredientController::class, 'delete']);  // Delete an ingredient by ID
    Route::put('/{id}', [IngredientController::class, 'update']);  // Update an ingredient by ID
    Route::get('/{id}', [IngredientController::class, 'searchById']);  // Search ingredient by ID
    Route::get('/name/{name}', [IngredientController::class, 'searchByName']);  // Search ingredient by name
    Route::get('/', [IngredientController::class, 'index']);  // Show all ingredients
});

// Unit of Measurement Routes (Grouped under 'unit_of_measurements')
Route::prefix('unit_of_measurements')->group(function () {
    Route::post('/', [UnitOfMeasurementController::class, 'add']);  // Add a new unit of measurement
    Route::delete('/{id}', [UnitOfMeasurementController::class, 'delete']);  // Delete a unit of measurement by ID
    Route::put('/{id}', [UnitOfMeasurementController::class, 'update']);  // Update a unit of measurement by ID
    Route::get('/{id}', [UnitOfMeasurementController::class, 'searchById']);  // Search unit of measurement by ID
    Route::get('/name/{name}', [UnitOfMeasurementController::class, 'searchByName']);  // Search unit of measurement by name
    Route::get('/', [UnitOfMeasurementController::class, 'index']);  // Show all of measurements
});

// Purchase Routes (Grouped under 'purchases')
Route::prefix('purchases')->group(function () {
    Route::get('/', [PurchaseController::class, 'index']);  // Show all of purchase
    Route::post('/', [PurchaseController::class, 'add']);  // Add a new purchase
    Route::put('/approve_status', [PurchaseController::class, 'searchByApproveStatus']);
    Route::get('/{id}', [PurchaseController::class, 'searchById']); 
    // 
    Route::delete('/{id}', [PurchaseController::class, 'delete']);  // Delete a purchase by ID
    Route::put('/{id}', [PurchaseController::class, 'update']);  // Update a purchase by ID
    Route::get('/{id}', [PurchaseController::class, 'searchById']);  // Search purchase by ID
    Route::get('/total_price/{total_price}', [PurchaseController::class, 'searchByTotalPrice']);  // Search purchase by total price
 // Search purchase by approval status
});

// Purchase Detail Routes (Grouped under 'purchase_details')
Route::prefix('purchase_details')->group(function () {
    Route::get('/', [PurchaseDetailController::class, 'index']);  // Show all of purchase detail
    Route::post('/', [PurchaseDetailController::class, 'add']);  // Add a new purchase detail
    Route::get('/ingredient/{ingredient_id}',[PurchaseDetailController::class, 'searchByIngredient']);
    Route::get('/purchase/{purchase_id}', [PurchaseDetailController::class, 'searchByPurchaseId']);
    // 
    Route::delete('/{id}', [PurchaseDetailController::class, 'delete']);  // Delete a purchase detail by ID
    Route::put('/{id}', [PurchaseDetailController::class, 'update']);  // Update a purchase detail by ID
    Route::get('/{id}', [PurchaseDetailController::class, 'searchById']);  // Search purchase detail by ID
      // Search purchase detail by purchase ID
   
});
// All Recipe Routes (Grouped under 'recipes','recipes_details')
Route::prefix('recipe')->group(function () {
    Route::get('/', [RecipeController::class, 'index']);
    Route::get('/{id}', [RecipeDetailController::class, 'show']);
    Route::post('/', [RecipeController::class, 'create']);
    Route::post('/detail', [RecipeDetailController::class, 'create']);
});
