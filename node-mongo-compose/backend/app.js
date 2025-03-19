const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

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
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
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

module.exports = { app, connectDB }