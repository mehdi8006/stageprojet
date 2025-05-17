<?php

// Set the path to the storage directory
$storagePath = __DIR__ . '/../storage/app/public/';

// Get the file path from the query string
$filePath = isset($_GET['file']) ? $_GET['file'] : '';

// Validate the file path to prevent directory traversal
if (empty($filePath) || strpos($filePath, '..') !== false) {
    header('HTTP/1.0 403 Forbidden');
    echo 'Access denied';
    exit;
}

// Construct the full file path
$fullPath = $storagePath . $filePath;

// Check if the file exists
if (!file_exists($fullPath)) {
    header('HTTP/1.0 404 Not Found');
    echo 'File not found';
    exit;
}

// Get the file extension
$extension = pathinfo($fullPath, PATHINFO_EXTENSION);

// Set the appropriate content type
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

$contentType = isset($contentTypes[$extension]) ? $contentTypes[$extension] : 'application/octet-stream';

// Set the headers
header('Content-Type: ' . $contentType);
header('Content-Disposition: inline; filename="' . basename($fullPath) . '"');
header('Content-Length: ' . filesize($fullPath));

// Output the file
readfile($fullPath); 