import 'module-alias/register';
import express, {Request, Response} from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import userRouter from "@/routes/v1/User";
import authRouter from '@/routes/v1/authentication'

import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";
import v1Router from './routes/v1';
import cookieParser from "cookie-parser";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)

const PORT = 8000


const app = express();
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

const basePath = '/api/v1';

// Use the base path when defining routes


// Use the v1 router
app.use('/api/v1', v1Router);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.listen(PORT, () => {
    console.log(`server running on localhost: ${PORT}`);
})