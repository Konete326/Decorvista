const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');

let mongoServer;
let userToken;
let product;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create a regular user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      role: 'homeowner'
    });
  userToken = userRes.body.token;

  // Create a category
  const category = await Category.create({
    name: 'Furniture',
    slug: 'furniture',
    description: 'Furniture items'
  });

  // Create a product
  product = await Product.create({
    title: 'Test Product',
    slug: 'test-product',
    description: 'Test Description',
    price: 99.99,
    category: category._id,
    inventory: 10
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Favorite.deleteMany({});
});

describe('Favorite Endpoints', () => {
  describe('POST /api/favorites', () => {
    it('should add a product to favorites', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'product',
          productId: product._id
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('product');
      expect(res.body.data.product.toString()).toBe(product._id.toString());
    });

    it('should not add favorite without auth', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .send({
          type: 'product',
          productId: product._id
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not add favorite with invalid type', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'invalid',
          productId: product._id
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/favorites', () => {
    it('should get user favorites', async () => {
      // Add a favorite first
      await Favorite.create({
        user: mongoose.Types.ObjectId.createFromHexString(userToken.split('.')[1].substring(0, 24)),
        type: 'product',
        product: product._id
      });

      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe('product');
    });

    it('should not get favorites without auth', async () => {
      const res = await request(app)
        .get('/api/favorites');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    it('should remove a favorite', async () => {
      // Add a favorite first
      const favorite = await Favorite.create({
        user: mongoose.Types.ObjectId.createFromHexString(userToken.split('.')[1].substring(0, 24)),
        type: 'product',
        product: product._id
      });

      const res = await request(app)
        .delete(`/api/favorites/${favorite._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not remove favorite without auth', async () => {
      const favorite = await Favorite.create({
        user: mongoose.Types.ObjectId.createFromHexString(userToken.split('.')[1].substring(0, 24)),
        type: 'product',
        product: product._id
      });

      const res = await request(app)
        .delete(`/api/favorites/${favorite._id}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
