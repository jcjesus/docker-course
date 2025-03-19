const { app, connectDB } = require('./app')

// Database connection
connectDB('mongodb://db/mydb')

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`)
}) 