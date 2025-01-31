<?php

namespace App\Http\Controllers;

use App\Models\UnitOfMeasurement;
use Illuminate\Http\Request;

class UnitOfMeasurementController extends Controller
{
    /**
     * Show all unit of measurements.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Retrieve all unit of measurements
        $unitOfMeasurements = UnitOfMeasurement::all();

        return response()->json($unitOfMeasurements, 200);  // Return as JSON response
    }

    /**
     * Add a new unit of measurement.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function add(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:unit_of_measurement,name',
        ]);

        $unitOfMeasurement = UnitOfMeasurement::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Unit of measurement added successfully',
            'unit_of_measurement' => $unitOfMeasurement
        ], 201);
    }

    /**
     * Delete a unit of measurement by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function delete($id)
    {
        $unitOfMeasurement = UnitOfMeasurement::find($id);

        if (!$unitOfMeasurement) {
            return response()->json(['message' => 'Unit of measurement not found'], 404);
        }

        $unitOfMeasurement->delete();

        return response()->json(['message' => 'Unit of measurement deleted successfully'], 200);
    }

    /**
     * Update a unit of measurement by ID.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $unitOfMeasurement = UnitOfMeasurement::find($id);

        if (!$unitOfMeasurement) {
            return response()->json(['message' => 'Unit of measurement not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:unit_of_measurement,name,' . $id,
        ]);

        $unitOfMeasurement->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Unit of measurement updated successfully',
            'unit_of_measurement' => $unitOfMeasurement
        ], 200);
    }

    /**
     * Search for a unit of measurement by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function searchById($id)
    {
        $unitOfMeasurement = UnitOfMeasurement::find($id);

        if (!$unitOfMeasurement) {
            return response()->json(['message' => 'Unit of measurement not found'], 404);
        }

        return response()->json($unitOfMeasurement, 200);
    }

    /**
     * Search for unit of measurements by name.
     *
     * @param string $name
     * @return \Illuminate\Http\Response
     */
    public function searchByName($name)
    {
        $unitOfMeasurements = UnitOfMeasurement::where('name', 'like', '%' . $name . '%')->get();

        if ($unitOfMeasurements->isEmpty()) {
            return response()->json(['message' => 'No unit of measurements found'], 404);
        }

        return response()->json($unitOfMeasurements, 200);
    }
}
