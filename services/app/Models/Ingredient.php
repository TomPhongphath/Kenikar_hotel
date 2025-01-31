<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category_id', 'unit_of_measurement_id', 'stock'];

    /**
     * Get the category that owns the ingredient.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the unit of measurement that owns the ingredient.
     */
    public function unit_of_measurement()
    {
        return $this->belongsTo(UnitOfMeasurement::class);  // Correct singular form
    }
}
