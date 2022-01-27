const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const redis = require('redis');
const session = require('express-session');
let RedisStore = require('connect-redis')(session);


const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require("./config/config");
// Route
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoute");

const app = express();

// To run behind a proxy nginx
app.set("Trust proxy", 1);  // app.enable("Trust proxy");

// Cors

const corsOptions ={
    //origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}
app.use(cors(corsOptions));

// use json format
app.use(express.json());

// Redis configuration
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
});

// Configuration session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    //name: "_sessionId",
    saveUninitialized: false,
    resave: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24 * 1
    },
}));

// Mongoose configuration
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const connectWithRetry = () => {
    mongoose
        .connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useFindAndModify: false,
        })
        .then(() => console.log("Connect to MongoDB..."))
        .catch((e) => {
            console.log(e);
            setTimeout(connectWithRetry, 5000);
        });
}

// Retry connection after time set 
connectWithRetry();

// localhost:3000/api/v1/
app.use("/api/v1/test/", (req, res) => {
    res.send("<h1>Welcome!</h1>");
    console.log("Welcome!!!");
});
// localhost:3000/api/v1/posts/
app.use("/api/v1/posts", postRouter);
// localhost:3000/api/v1/users/
app.use("/api/v1/users", userRouter);

// port
const port = process.env.PORT || 5555;

app.listen(port, () => console.log(`Server is running on port ${port}`));