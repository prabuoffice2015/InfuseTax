<?php

namespace App\Http\Controllers;

use App\Core\Response;
use App\Http\Middleware\AuthMiddleware;
use App\Models\Notification;

/**
 * Class NotificationController (Eloquent-powered)
 *
 * @package App\Http\Controllers
 */
class NotificationController {
    /**
     * Lists active notifications for the authenticated user.
     */
    public function list(): void {
        $claims = AuthMiddleware::authenticate();
        $userId = $claims['sub'] ?? '';

        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $unreadCount = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        Response::json([
            'status'        => 'success',
            'unread_count'  => $unreadCount,
            'notifications' => $notifications
        ]);
    }

    /**
     * Marks all notifications as read for the authenticated user.
     */
    public function markAsRead(array $body): void {
        $claims = AuthMiddleware::authenticate();
        $userId = $claims['sub'] ?? '';

        Notification::where('user_id', $userId)->update(['is_read' => true]);

        Response::json([
            'status'  => 'success',
            'message' => 'All notifications marked as read.'
        ]);
    }
}
