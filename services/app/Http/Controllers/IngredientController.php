<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    /**
     * Show all ingredients.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $ingredients = Ingredient::with(['category', 'unit_of_measurement'])->get(); // Correct singular here

        return response()->json($ingredients, 200);
    }

    /**
     * Add a new ingredient.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function add(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit_of_measurement_id' => 'required|exists:unit_of_measurements,id',  // Plural here
            'stock' => 'required|integer',
        ]);

        $ingredient = Ingredient::create([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'unit_of_measurement_id' => $request->unit_of_measurement_id,
            'stock' => $request->stock,
        ]);

        return response()->json([
            'message' => 'Ingredient added successfully',
            'ingredient' => $ingredient->load(['category', 'unit_of_measurement']) // Eager load related data
        ], 201);
    }

    /**
     * Delete an ingredient by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function delete($id)
    {
        $ingredient = Ingredient::find($id);

        if (!$ingredient) {
            return response()->json(['message' => 'Ingredient not found'], 404);
        }

        $ingredient->delete();

        return response()->json(['message' => 'Ingredient deleted successfully'], 200);
    }

    /**
     * Update an ingredient by ID.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $ingredient = Ingredient::find($id);

        if (!$ingredient) {
            return response()->json(['message' => 'Ingredient not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit_of_measurement_id' => 'required|exists:unit_of_measurement,id',
            'stock' => 'required|integer',
        ]);

        $ingredient->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'unit_of_measurement_id' => $request->unit_of_measurement_id,
            'stock' => $request->stock,
        ]);

        return response()->json([
            'message' => 'Ingredient updated successfully',
            'ingredient' => $ingredient->load(['category', 'unit_of_measurement']) // Eager load related data
        ], 200);
    }

    /**
     * Search for an ingredient by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function searchById($id)
    {
        $ingredient = Ingredient::with(['category', 'unit_of_measurement'])->find($id);

        if (!$ingredient) {
            return response()->json(['message' => 'Ingredient not found'], 404);
        }

        return response()->json($ingredient, 200);
    }

    /**
     * Search for ingredients by name.
     *
     * @param string $name
     * @return \Illuminate\Http\Response
     */
    public function searchByName($name)
    {
        $ingredients = Ingredient::with(['category', 'unit_of_measurement'])
            ->where('name', '=', $name)
            ->get();

        if ($ingredients->isEmpty()) {
            return response()->json(['message' => 'No ingredients found'], 404);
        }

        return response()->json($ingredients, 200);
    }
}
