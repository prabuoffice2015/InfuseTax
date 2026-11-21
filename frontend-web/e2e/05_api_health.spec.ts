import { test, expect } from '@playwright/test';

test.describe('05 - Local Environment Healthcheck & API Verifications', () => {
  test('should return 200 OK with PostgreSQL and Redis status from /api/v1/health', async ({ request }) => {
    const response = await request.get('/api/v1/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.database).toContain('PostgreSQL');
    expect(data.redis).toContain('Redis');
  });

  test('should return 401 Unauthorized when accessing protected endpoint without token', async ({ request }) => {
    const response = await request.get('/api/v1/admin/users');
    expect(response.status()).toBe(401);
  });
});
