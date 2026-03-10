import {Router} from "express";
import { profileCreation } from "./driver.controller";

const driverRouter:Router = Router()

driverRouter.post('/update-profile',profileCreation)


export { driverRouter }