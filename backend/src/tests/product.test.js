const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

let mongoServer;
let adminToken;
let category;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
  adminToken = adminRes.body.token;

  category = await Category.create({
    name: 'Furniture',
    slug: 'furniture',
    description: 'Furniture items'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe('Product Endpoints', () => {
  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: category._id,
          inventory: 10
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Product');
    });

    it('should not create product without auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          title: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: category._id,
          inventory: 10
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/products', () => {
    it('should get products list', async () => {
      await Product.create({
        title: 'Product 1',
        slug: 'product-1',
        description: 'Description 1',
        price: 50,
        category: category._id,
        inventory: 5
      });

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toBeDefined();
    });
  });
});
