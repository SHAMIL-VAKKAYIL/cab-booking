import express from "express";
import { authRouter } from "./modules/auth/auth.routes";
import {errorHandler} from "@cab/observability";

export const app = express()


app.use(errorHandler)

app.use(express.json());
app.use('/auth',authRouter)



app.use(errorHandler)

