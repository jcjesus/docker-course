const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por windowMs
  message: { error: 'Muitas requisições, por favor tente novamente mais tarde.' },
  standardHeaders: true, // Retorna informações de rate limit nos headers
  legacyHeaders: false, // Desabilita headers legados
})

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

// Aplicando rate limiting em todas as rotas
app.use(limiter)

// Model
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true }
})

const Client = mongoose.model('Client', clientSchema)

// Routes
app.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find()
    res.json(clients)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/clients', async (req, res) => {
  try {
    const client = new Client(req.body)
    await client.save()
    res.status(201).json(client)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.put('/clients/:id', async (req, res) => {
  try {
    const validatedBody = validateRequestBody(req.body);
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: validatedBody },
      { new: true, runValidators: true }
    )
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    res.json(client)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.delete('/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)
    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Connect to MongoDB
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const validateRequestBody = (body) => {
  const allowedFields = ['name'];
  const validatedBody = {};
  for (const key in body) {
    if (allowedFields.includes(key)) {
      validatedBody[key] = body[key];
    }
  }
  return validatedBody;
}

module.exports = { app, connectDB }