const request = require('supertest');
const express = require('express');

// Create a simple mock app for testing generic middleware/routes
const app = express();
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

describe('Server Health Check', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
