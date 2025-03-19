const request = require('supertest')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const { app, connectDB } = require('./app')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await connectDB(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

describe('Client API', () => {
  describe('POST /clients', () => {
    it('should create a new client', async () => {
      const response = await request(app)
        .post('/clients')
        .send({ name: 'John Doe' })
      
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('John Doe')
      expect(response.body._id).toBeDefined()
    })

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/clients')
        .send({})
      
      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })
  })

  describe('GET /clients', () => {
    it('should return empty array when no clients exist', async () => {
      const response = await request(app).get('/clients')
      
      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('should return all clients', async () => {
      // Create test clients
      await request(app).post('/clients').send({ name: 'John Doe' })
      await request(app).post('/clients').send({ name: 'Jane Doe' })

      const response = await request(app).get('/clients')
      
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
      expect(response.body[0].name).toBe('John Doe')
      expect(response.body[1].name).toBe('Jane Doe')
    })
  })

  describe('GET /clients/:id', () => {
    it('should return client by id', async () => {
      const createResponse = await request(app)
        .post('/clients')
        .send({ name: 'John Doe' })

      const response = await request(app)
        .get(`/clients/${createResponse.body._id}`)
      
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('John Doe')
    })

    it('should return 404 when client not found', async () => {
      const response = await request(app)
        .get('/clients/123456789012345678901234')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Client not found')
    })
  })

  describe('PUT /clients/:id', () => {
    it('should update client', async () => {
      const createResponse = await request(app)
        .post('/clients')
        .send({ name: 'John Doe' })

      const response = await request(app)
        .put(`/clients/${createResponse.body._id}`)
        .send({ name: 'John Updated' })
      
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('John Updated')
    })

    it('should return 404 when updating non-existent client', async () => {
      const response = await request(app)
        .put('/clients/123456789012345678901234')
        .send({ name: 'John Updated' })
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Client not found')
    })
  })

  describe('DELETE /clients/:id', () => {
    it('should delete client', async () => {
      const createResponse = await request(app)
        .post('/clients')
        .send({ name: 'John Doe' })

      const response = await request(app)
        .delete(`/clients/${createResponse.body._id}`)
      
      expect(response.status).toBe(200)

      // Verify client was deleted
      const getResponse = await request(app)
        .get(`/clients/${createResponse.body._id}`)
      expect(getResponse.status).toBe(404)
    })

    it('should return 404 when deleting non-existent client', async () => {
      const response = await request(app)
        .delete('/clients/123456789012345678901234')
      
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Client not found')
    })
  })
}) 