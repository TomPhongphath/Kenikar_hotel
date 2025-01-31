<?php

namespace App\Http\Controllers;
use App\Models\RecipeDetail;
use App\Models\Recipe;
use Illuminate\Http\Request;

class RecipeDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $request->validate([
            'recipes_id' => 'required|exists:recipes,id' ,
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|integer',
        ]);

        $recipedetail = RecipeDetail::create([
            'recipes_id' => $request->recipes_id,
            'ingredient_id' => $request->ingredient_id,
            'quantity' => $request->quantity,
        ]);

        return response()->json([
            'message' => 'recipedetail added successfully',
            'recipedetail' => $recipedetail,// Eager load related data
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $recipe = Recipe::find($id);
        $recipedetail = RecipeDetail::with(['ingredient'])->where('recipes_id', $id)->get();
        if (!$recipedetail || !$recipe) {
            return response()->json(['message' => 'not found'], 404);
        }
        return response()->json([
            'recipe' => $recipe,
            'recipedetails' => $recipedetail
        ] ,200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
