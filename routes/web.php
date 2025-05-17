<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

Route::get('/', function () {
    return view('welcome');
});

// Add this route for secure file downloads
Route::get('/download/{path}', function ($path) {
    // Prevent directory traversal
    if (strpos($path, '..') !== false) {
        abort(403, 'Access denied');
    }
    
    // Try both storage locations
    $storagePath = storage_path('app/public/' . $path);
    $publicPath = public_path('storage/' . $path);
    
    // Log the paths for debugging
    \Log::info('Storage path: ' . $storagePath);
    \Log::info('Public path: ' . $publicPath);
    
    $fullPath = null;
    if (file_exists($storagePath)) {
        $fullPath = $storagePath;
        \Log::info('File found in storage path');
    } elseif (file_exists($publicPath)) {
        $fullPath = $publicPath;
        \Log::info('File found in public path');
    }
    
    if (!$fullPath) {
        \Log::error('File not found in either location');
        abort(404, 'File not found');
    }
    
    // Get file extension for content type
    $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
    $contentTypes = [
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt' => 'text/plain',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
    ];
    
    $contentType = $contentTypes[$extension] ?? 'application/octet-stream';
    
    return response()->file($fullPath, [
        'Content-Type' => $contentType,
        'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"'
    ]);
})->where('path', '.*');
