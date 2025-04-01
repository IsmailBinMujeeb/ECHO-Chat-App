import express from "express";
import { config } from "dotenv";
config();

// Routes Import
import indexRouter from "./routes/home.router.js"

const app = express();
const PORT  = process.env.PORT;

app.set('PORT', PORT);
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);

export default app