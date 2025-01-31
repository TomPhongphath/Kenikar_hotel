<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'ingredient_id',
        'price',
        'quantity',
        'unit_of_measurement_id',
        'purchase_id',
    ];

    /**
     * Get the ingredient associated with the purchase detail.
     */
    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * Get the unit of measurement associated with the purchase detail.
     */
    public function unit_of_measurement()
    {
        return $this->belongsTo(UnitOfMeasurement::class);
    }

    /**
     * Get the purchase that owns the purchase detail.
     */
    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}
