import express, {Request, Response} from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import authRoutes from "./routes/auth";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)

const PORT = 8000


const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`server running on localhost: ${PORT}`);
})