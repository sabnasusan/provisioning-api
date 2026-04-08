import request from 'supertest';
import { createApp } from '../../../src/app';
import { Application } from 'express';
import { container } from '../../../src/container';

describe('Provisioning API Integration Tests', () => {
  let app: Application;
  const validApiKey = 'dev-api-key';

  beforeEach(() => {
    app = createApp();
    container.reset();
  });

  describe('POST /provision', () => {
    const validPayload = {
      idempotencyKey: 'test-key-1',
      requestor: 'user@example.com',
      environment: 'dev',
      workloadName: 'my-service',
      components: ['app-service'],
    };

    // Required Test 1: POST with valid payload returns 201
    it('should create a new provisioning request with valid payload', async () => {
      const response = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('requestId');
      expect(response.body.idempotencyKey).toBe(validPayload.idempotencyKey);
      expect(response.body.requestor).toBe(validPayload.requestor);
      expect(response.body.environment).toBe(validPayload.environment);
      expect(response.body.workloadName).toBe(validPayload.workloadName);
      expect(response.body.components).toEqual(validPayload.components);
      expect(response.body.status).toBe('RECEIVED');
    });

    // Required Test 2: Same idempotencyKey + same payload returns same requestId
    it('should return the same response for idempotent request with same payload', async () => {
      const response1 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(validPayload);

      expect(response1.status).toBe(201);
      const requestId = response1.body.requestId;

      const response2 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(validPayload);

      expect(response2.status).toBe(201);
      expect(response2.body.requestId).toBe(requestId);
    });

    // Required Test 3: Same idempotencyKey + different payload returns 409
    it('should return 409 for idempotent request with different payload', async () => {
      const response1 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(validPayload);

      expect(response1.status).toBe(201);

      const differentPayload = {
        ...validPayload,
        workloadName: 'different-service',
      };

      const response2 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(differentPayload);

      expect(response2.status).toBe(409);
      expect(response2.body.code).toBe('IDEMPOTENCY_CONFLICT');
    });

    // Additional Test: POST without API key returns 401
    it('should return 401 when API key is missing', async () => {
      const response = await request(app).post('/provision').send(validPayload);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    // Additional Test: POST with invalid API key returns 403
    it('should return 403 when API key is invalid', async () => {
      const response = await request(app)
        .post('/provision')
        .set('x-api-key', 'invalid-key')
        .send(validPayload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    // Additional Test: POST with invalid workloadName returns 400
    it('should return 400 when workloadName is invalid', async () => {
      const invalidPayload = {
        ...validPayload,
        workloadName: 'Invalid_Name', // Not kebab-case
      };

      const response = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(invalidPayload);

      expect(response.status).toBe(400);
    });

    // Additional Test: POST prod without key-vault returns 400
    it('should return 400 when prod environment lacks key-vault component', async () => {
      const prodPayload = {
        ...validPayload,
        environment: 'prod',
        components: ['app-service'], // No key-vault
      };

      const response = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(prodPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('key-vault');
    });

    // Additional Test: POST prod with key-vault returns 201
    it('should return 201 when prod environment has key-vault component', async () => {
      const prodPayload = {
        ...validPayload,
        idempotencyKey: 'test-key-prod',
        environment: 'prod',
        components: ['app-service', 'key-vault'],
      };

      const response = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send(prodPayload);

      expect(response.status).toBe(201);
      expect(response.body.environment).toBe('prod');
    });

    // Critical Test: Email normalization in idempotency
    it('should treat normalized emails as identical for idempotency', async () => {
      const response1 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          ...validPayload,
          idempotencyKey: 'test-email-norm',
          requestor: 'USER@EXAMPLE.COM',
        });

      expect(response1.status).toBe(201);
      expect(response1.body.requestor).toBe('user@example.com');
      const requestId = response1.body.requestId;

      // Send again with lowercase email - should be treated as same request
      const response2 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          ...validPayload,
          idempotencyKey: 'test-email-norm',
          requestor: 'user@example.com',
        });

      expect(response2.status).toBe(201);
      expect(response2.body.requestId).toBe(requestId);
    });

    // Critical Test: Idempotency key trimming
    it('should treat trimmed idempotency keys as identical', async () => {
      const response1 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          ...validPayload,
          idempotencyKey: '  test-key-trim  ',
        });

      expect(response1.status).toBe(201);
      expect(response1.body.idempotencyKey).toBe('test-key-trim');
      const requestId = response1.body.requestId;

      // Send again with trimmed key - should be treated as same request
      const response2 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          ...validPayload,
          idempotencyKey: 'test-key-trim',
        });

      expect(response2.status).toBe(201);
      expect(response2.body.requestId).toBe(requestId);
    });

    // Critical Test: Email case difference should cause conflict, not duplicate
    it('should return 409 when same idempotency key used with different (non-normalized) data', async () => {
      const response1 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          ...validPayload,
          idempotencyKey: 'test-conflict',
          requestor: 'user@example.com',
        });

      expect(response1.status).toBe(201);

      // Different workload name - should conflict
      const response2 = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          ...validPayload,
          idempotencyKey: 'test-conflict',
          requestor: 'user@example.com',
          workloadName: 'different-service',
        });

      expect(response2.status).toBe(409);
      expect(response2.body.code).toBe('IDEMPOTENCY_CONFLICT');
    });
  });

  describe('GET /provision/:requestId', () => {
    // Additional Test: GET unknown requestId returns 404
    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/provision/00000000-0000-0000-0000-000000000000')
        .set('x-api-key', validApiKey);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    // Additional Test: GET existing requestId returns 200
    it('should return 200 for existing request', async () => {
      const createResponse = await request(app)
        .post('/provision')
        .set('x-api-key', validApiKey)
        .send({
          idempotencyKey: 'test-key-get',
          requestor: 'user@example.com',
          environment: 'dev',
          workloadName: 'my-service',
          components: ['app-service'],
        });

      const requestId = createResponse.body.requestId;

      const getResponse = await request(app)
        .get(`/provision/${requestId}`)
        .set('x-api-key', validApiKey);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.requestId).toBe(requestId);
    });
  });

  describe('GET /health', () => {
    // Additional Test: GET /health returns 200
    it('should return 200 with healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
