import express from 'express'
import { driverRouter } from './modules/driver/driver.routes'

const app:express.Application = express()

app.use(express.json())
app.use('/api/driver', driverRouter)

app.use((err:any, req:any, res:any, next:any) => {
  if (err.message === 'Driver not found') {
    return res.status(404).json({ message: err.message })
  }
  if (err.message === 'Forbidden') {
    return res.status(403).json({ message: err.message })
  }
  if (err.message === 'Driver account is not approved') {
    return res.status(403).json({ message: err.message })
  }
  if (err.message === 'Cannot toggle availability while on a trip') {
    return res.status(400).json({ message: err.message })
  }
  res.status(500).json({ message: 'Internal server error' })
})

export { app }