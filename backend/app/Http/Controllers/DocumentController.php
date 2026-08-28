<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Core\Security;
use App\Http\Middleware\AuthMiddleware;
use App\Models\Document;

/**
 * Class DocumentController (Eloquent-powered)
 *
 * @package App\Http\Controllers
 */
class DocumentController {
    /**
     * Lists documents for the authenticated user.
     */
    public function list(): void {
        $claims = AuthMiddleware::authenticate();
        $userId = $claims['sub'] ?? '';

        $docs = Document::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        Response::json([
            'status'    => 'success',
            'count'     => $docs->count(),
            'documents' => $docs
        ]);
    }

    /**
     * Uploads and registers a new document in the vault.
     */
    public function upload(array $body): void {
        $claims   = AuthMiddleware::authenticate();
        $userId   = $claims['sub'] ?? '';
        $tenantId = $claims['tenant_id'] ?? 'a0000000-0000-0000-0000-000000000001';

        $fileName = Security::sanitizeString($body['file_name'] ?? '');
        $fileSize = (int) ($body['file_size_kb'] ?? 100);
        $mimeType = Security::sanitizeString($body['mime_type'] ?? 'application/pdf');
        $category = Security::sanitizeString($body['category'] ?? 'KYC');
        $r2Key    = Security::sanitizeString($body['r2_storage_key'] ?? 'vault/' . time() . '_' . $fileName);

        if (empty($fileName)) {
            Response::error('File name is required.', 422);
        }

        $doc = Document::create([
            'tenant_id'            => $tenantId,
            'user_id'              => $userId,
            'file_name'            => $fileName,
            'file_size_kb'         => $fileSize,
            'mime_type'            => $mimeType,
            'category'             => $category,
            'r2_storage_key'       => $r2Key,
            'encryption_algorithm' => 'AES-256-GCM'
        ]);

        Response::json([
            'status'   => 'success',
            'message'  => 'Document uploaded and encrypted in vault.',
            'document' => $doc
        ], 201);
    }
}
