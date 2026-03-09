import {Router} from "express";
import { profileCreation } from "./rider.controller";

const riderRouter:Router = Router()

riderRouter.post('/v1/update-profile',profileCreation)


export { riderRouter }