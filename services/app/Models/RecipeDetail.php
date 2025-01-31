<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeDetail extends Model
{
    use HasFactory;
    protected $table = 'recipes_details';
    protected $fillable = [
        'recipes_id',
        'ingredient_id',
        'quantity',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
    public function recipes()
    {
        return $this->belongsTo(Recipes::class);
    }
}
