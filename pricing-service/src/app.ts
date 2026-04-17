import express from 'express'

const app: express.Application = express()

app.use(express.json())
app.use('/health', (req, res) => {
  res.send('OK');
})



export { app }