import express from "express";
import topRoutes from "./routes/topRoutes.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
const app = express();

dotenv.config();
app.use(morgan('dev'));

const port  = process.env.PORT;

connectDB()

app.use(cookieParser());

app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.LOCAL_FRONTEND_URL],
    credentials: true
}));


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/iRoof",topRoutes);

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
})
