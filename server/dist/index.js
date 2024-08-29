"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV !== 'production') {
    import('dotenv/config');
}
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const database_1 = require("./database");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "https://mern-todo-app-rho.vercel.app", // Replace with your front-end URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.get("/", (req, res) => {
    res.status(200).json({
        msg: "hello"
    });
    // res.send({
    //     anotherMsg: "hello again"
    // })
});
// Middleware to parse JSON bodies for POST and others
app.use(express_1.default.json());
app.use("/api", routes_1.router);
// Local
// const port = process.env.PORT || 4000
(0, database_1.connectToMogoDB)();
// Local
// const startServer = async () => {
//     await connectToMogoDB()
//     app.listen(port, () => {
//         console.log(`Server is listening on http://localhost:${port}`);
//     })
// }
// startServer()
exports.default = app;
