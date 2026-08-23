<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Services\GovernmentApiService;

class GovernmentController {
    public function verifyPan(array $body): void {
        $pan = $body['pan'] ?? '';
        $result = GovernmentApiService::verifyPan($pan);

        if (!$result['valid']) {
            Response::error($result['message'], 400);
        }

        Response::json(array_merge(['status' => 'success'], $result));
    }

    public function verifyGstin(array $body): void {
        $gstin = $body['gstin'] ?? '';
        $result = GovernmentApiService::verifyGstin($gstin);

        if (!$result['valid']) {
            Response::error($result['message'], 400);
        }

        Response::json(array_merge(['status' => 'success'], $result));
    }
}
