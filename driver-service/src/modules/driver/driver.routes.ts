import express from "express";
import { profileCreation } from "./driver.controller";

const driverRouter = express.Router()

driverRouter.post('/update-profile',profileCreation)


export { driverRouter }