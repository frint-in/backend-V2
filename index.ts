import 'module-alias/register';
import express, {Request, Response} from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import userRouter from "@/routes/v1/User";
import authRouter from '@/routes/v1/authentication'
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)

const PORT = 8000


const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.listen(PORT, () => {
    console.log(`server running on localhost: ${PORT}`);
})