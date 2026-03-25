import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  updateVehicle,
  toggleAvailability,
  getRating,
} from './driver.controller'

const driverRouter:Router = Router()

driverRouter.get('/v1/get-profile',          getProfile)
driverRouter.post('/v1/update-profile',       updateProfile)
driverRouter.post('/v1/vehicle',              updateVehicle)
driverRouter.post('/v1/toggle-availability',  toggleAvailability)
driverRouter.get('/v1/rating',               getRating)

export { driverRouter }