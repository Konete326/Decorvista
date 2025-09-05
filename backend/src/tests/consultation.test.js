const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const Designer = require('../models/Designer');
const Consultation = require('../models/Consultation');

let mongoServer;
let homeownerToken;
let designerToken;
let designer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create a homeowner user
  const homeownerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Homeowner User',
      email: 'homeowner@example.com',
      password: 'password123',
      role: 'homeowner'
    });
  homeownerToken = homeownerRes.body.token;

  // Create a designer user
  const designerUserRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Designer User',
      email: 'designer@example.com',
      password: 'password123',
      role: 'designer'
    });
  designerToken = designerUserRes.body.token;

  // Create a designer profile
  designer = await Designer.create({
    user: mongoose.Types.ObjectId.createFromHexString(designerToken.split('.')[1].substring(0, 24)),
    bio: 'Experienced interior designer',
    specialties: ['residential', 'commercial'],
    location: 'New York',
    hourlyRate: 100,
    availabilitySlots: [
      {
        date: new Date(),
        from: '09:00',
        to: '17:00',
        status: 'available'
      }
    ]
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Consultation.deleteMany({});
});

describe('Consultation Endpoints', () => {
  describe('POST /api/consultations', () => {
    it('should create a consultation booking', async () => {
      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          designer: designer._id,
          slot: {
            date: new Date().toISOString(),
            time: '10:00'
          },
          serviceType: 'online'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designer.toString()).toBe(designer._id.toString());
      expect(res.body.data.status).toBe('pending');
    });

    it('should not create consultation without auth', async () => {
      const res = await request(app)
        .post('/api/consultations')
        .send({
          designer: designer._id,
          slot: {
            date: new Date().toISOString(),
            time: '10:00'
          },
          serviceType: 'online'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/consultations', () => {
    it('should get consultations for homeowner', async () => {
      // Create a consultation first
      await Consultation.create({
        homeowner: mongoose.Types.ObjectId.createFromHexString(homeownerToken.split('.')[1].substring(0, 24)),
        designer: designer._id,
        slot: {
          date: new Date(),
          time: '10:00'
        },
        serviceType: 'online'
      });

      const res = await request(app)
        .get('/api/consultations')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should get consultations for designer', async () => {
      // Create a consultation first
      await Consultation.create({
        homeowner: mongoose.Types.ObjectId.createFromHexString(homeownerToken.split('.')[1].substring(0, 24)),
        designer: designer._id,
        slot: {
          date: new Date(),
          time: '10:00'
        },
        serviceType: 'online'
      });

      const res = await request(app)
        .get('/api/consultations')
        .set('Authorization', `Bearer ${designerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/consultations/:id', () => {
    it('should update consultation status as designer', async () => {
      // Create a consultation first
      const consultation = await Consultation.create({
        homeowner: mongoose.Types.ObjectId.createFromHexString(homeownerToken.split('.')[1].substring(0, 24)),
        designer: designer._id,
        slot: {
          date: new Date(),
          time: '10:00'
        },
        serviceType: 'online'
      });

      const res = await request(app)
        .put(`/api/consultations/${consultation._id}`)
        .set('Authorization', `Bearer ${designerToken}`)
        .send({
          status: 'confirmed'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('should not update consultation status as unauthorized user', async () => {
      // Create a consultation first
      const consultation = await Consultation.create({
        homeowner: mongoose.Types.ObjectId.createFromHexString(homeownerToken.split('.')[1].substring(0, 24)),
        designer: designer._id,
        slot: {
          date: new Date(),
          time: '10:00'
        },
        serviceType: 'online'
      });

      const res = await request(app)
        .put(`/api/consultations/${consultation._id}`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          status: 'confirmed'
        });

      expect(res.statusCode).toBe(403);
    });
  });
});
