<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Historique;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    // GET /api/historiques
    public function index()
    {
        $historiques = Historique::all();
        return response()->json($historiques);
    }

    // POST /api/historiques
    public function store(Request $request) {
        // Validate the request
        $request->validate([
            'dochistorique_path' => 'required|file|mimes:pdf,doc,docx,txt',
        ]);
    
        // Store the file and get the path
        $filePath = $request->file('dochistorique_path')->store('historiques', 'public');
    
        // Save to database
        Historique::create([
            'description' => $request->description,
            'task_id' => $request->task_id,
            'change_date' => $request->change_date,
            'dochistorique_path' => $filePath, // e.g., "historiques/filename.pdf"
        ]);
    }

    // GET /api/historiques/{historique}
    public function show(Historique $historique)
    {
        return response()->json($historique);
    }

    // PUT/PATCH /api/historiques/{historique}
    public function update(Request $request, Historique $historique)
    {
        $validatedData = $request->validate([
            'description' => 'required|max:500',
            'change_date' => 'required|date',
            'dochistorique_path' => 'nullable|max:255',
            'task_id'     => 'required|integer',
        ]);

        $historique->update($validatedData);
        return response()->json([
            'message' => 'Historique updated successfully',
            'data'    => $historique
        ]);
    }

    // DELETE /api/historiques/{historique}
    public function destroy(Historique $historique)
    {
        $historique->delete();
        return response()->json(['message' => 'Historique deleted successfully']);
    }
}
