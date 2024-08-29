if (process.env.NODE_ENV !== 'production') {
    import('dotenv/config');
}
import express, { Express, Request, Response } from "express";
import { router } from "./routes";
import { connectToMogoDB } from './database';

const app: Express = express()

app.get("/", (req: Request, res: Response) => {                 // positional args
    res.status(200).json({
        msg: "hello" 
    })
    // res.send({
    //     anotherMsg: "hello again"
    // })
})

// Middleware to parse JSON bodies for POST and others
app.use(express.json())

app.use("/api", router)

// Local
// const port = process.env.PORT || 4000

connectToMogoDB()
// Local
// const startServer = async () => {
//     await connectToMogoDB()

//     app.listen(port, () => {
//         console.log(`Server is listening on http://localhost:${port}`);
//     })
// }

// startServer()

export default app