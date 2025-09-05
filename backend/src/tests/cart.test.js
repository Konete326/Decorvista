const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');

let mongoServer;
let userToken;
let product;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      role: 'homeowner'
    });
  userToken = userRes.body.token;

  const category = await Category.create({
    name: 'Decor',
    slug: 'decor',
    description: 'Decorative items'
  });

  product = await Product.create({
    title: 'Test Product',
    slug: 'test-product',
    description: 'Test Description',
    price: 49.99,
    category: category._id,
    inventory: 20
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Cart.deleteMany({});
});

describe('Cart Endpoints', () => {
  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: product._id,
          quantity: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
    });

    it('should not add item with insufficient inventory', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: product._id,
          quantity: 100
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/cart', () => {
    it('should get user cart', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
