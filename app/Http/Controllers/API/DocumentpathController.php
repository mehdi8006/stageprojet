<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Documentpath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentpathController extends Controller
{
    // GET /api/documentpaths
    public function index()
    {
        $documentpaths = Documentpath::all();
        return response()->json($documentpaths);
    }

    // POST /api/documentpaths
    
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'document_path' => 'required|file|mimes:pdf,doc,docx,txt|max:2048',
            'task_id'       => 'required|integer',
            'hist_id'       => 'nullable|integer',
        ]);
        if ($request->hasFile('document_path')) {
            $file = $request->file('document_path');
            
            // Save to the 'public' disk under 'uploads' directory
            $path = $file->store('uploads', 'public');
    
            // Save to database
            $document = Documentpath::create([
                'task_id' => $request->task_id,
                'document_path' => $path, // Path: 'uploads/filename.pdf'
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully!',
                'data' => $document,
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'File upload failed.',
        ], 400);
    }

    // GET /api/documentpaths/{documentpath}
    public function show(Documentpath $documentpath)
    {
        return response()->json($documentpath);
    }

    // PUT/PATCH /api/documentpaths/{documentpath}
    public function update(Request $request, Documentpath $documentpath)
    {
        $validatedData = $request->validate([
            'document_path' => 'required|max:255',
            'task_id'       => 'required|integer',
            'hist_id'       => 'nullable|integer',
        ]);

        $documentpath->update($validatedData);
        return response()->json([
            'message' => 'Document updated successfully',
            'data'    => $documentpath
        ]);
    }

    // DELETE /api/documentpaths/{documentpath}
    public function destroy(Documentpath $documentpath)
    {
        $documentpath->delete();
        return response()->json(['message' => 'Document deleted successfully']);
    }
}
