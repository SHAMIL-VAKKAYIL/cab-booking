import { Request, Response, NextFunction } from 'express'
import { httpRequestTotal, httpRequestDuration } from './metrics'

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const route   = req.route?.path || req.path
    const method  = req.method
    const status  = res.statusCode.toString()

    httpRequestTotal.inc({ method, route, status_code: status })
    httpRequestDuration.observe({ method, route, status_code: status }, duration)
  })

  next()
}