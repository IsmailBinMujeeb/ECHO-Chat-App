import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
config();

// Routes Import
import indexRouter from "./routes/home.router.js"
import userRouter from "./routes/user.routes.js"

const app = express();
const PORT  = process.env.PORT;

app.set('PORT', PORT);
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/user/', userRouter);

export default app