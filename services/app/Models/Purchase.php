<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    // Table name if it's different from the plural form of the model name
    protected $table = 'purchases';

    // Fillable fields for mass assignment
    protected $fillable = [
        'total_price',
        'approve_status',
    ];

    /**
     * Get the purchase details associated with the purchase.
     */
    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }
}
