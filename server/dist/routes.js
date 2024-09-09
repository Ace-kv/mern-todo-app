"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const mongodb_1 = require("mongodb");
exports.router = express_1.default.Router();
// Middleware to CONNECT to the database ONCE, get the collection, and pass the collection to res.locals for temporary data
// i.e. any data that needs to be passed between middleware functions and route handlers only for the duration of a single request.
// Examples include a MongoDB collection reference, user authentication data, or any state needed only for the current HTTP request.
const getCollectionMiddleWare = async (req, res, next) => {
    try {
        await (0, database_1.connectToMogoDB)();
        const client = (0, database_1.getConnectedClient)();
        const collection = client?.db("todosdb").collection("todos");
        if (!collection) {
            return res.status(500).json({
                msg: "Failed to get the collection",
            });
        }
        res.locals.collection = collection; // Store collection in res.locals
        next(); // Continue to the next middleware or route handler
    }
    catch (error) {
        // Handle unknown error type safely
        if (error instanceof Error) {
            res.status(500).json({
                msg: "Database connection error",
                error: error.message
            });
        }
        else {
            res.status(500).json({
                msg: "Unknown error occurred"
            });
        }
    }
};
// Apply the middleware to use the collection in all routes
exports.router.use(getCollectionMiddleWare);
// GET /todos
exports.router.get('/todos', async (req, res) => {
    const collection = res.locals.collection; // Access the collection from res.locals
    const todos = await collection?.find({}).toArray();
    res.status(200).json(todos);
});
// POST /todos
exports.router.post('/todos', async (req, res) => {
    const collection = res.locals.collection;
    const { todo } = req.body;
    if (!todo) {
        return res.status(400).json({
            msg: "No Todo found"
        });
    }
    const newTodo = await collection?.insertOne({
        todo: typeof (todo) !== "string" ? JSON.stringify(todo) : todo,
        status: false
    });
    res.status(201).json({
        todo: todo,
        status: false,
        _id: newTodo?.insertedId
    });
});
// DELETE /todos/:id - Delete a single todo by ID
exports.router.delete('/todos/:id', async (req, res) => {
    const collection = res.locals.collection;
    // mongoDB requirement to handle ids
    const _id = new mongodb_1.ObjectId(req.params.id);
    const deletedTodo = await collection?.deleteOne({ _id: _id });
    res.status(200).json({
        deletedTodo: deletedTodo
    });
});
// DELETE /todos - Delete multiple todos by ID(s)
exports.router.delete('/todos', async (req, res) => {
    const collection = res.locals.collection;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            msg: "No valid IDs provided for deletion.",
        });
    }
    const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
    const deleteResult = await collection.deleteMany({ _id: { $in: objectIds } });
    res.status(200).json({
        deletedCount: deleteResult.deletedCount,
        msg: `${deleteResult.deletedCount} todos deleted.`,
    });
});
// PUT /todos/:id
exports.router.put('/todos/:id', async (req, res) => {
    const collection = res.locals.collection;
    // mongoDB requirement to handle ids
    const _id = new mongodb_1.ObjectId(req.params.id);
    const { status, todo } = req.body;
    // Prepare the fields to update
    const updateFields = {};
    // Validate and add status to the updateFields if present
    if (status !== undefined) {
        if (typeof (status) !== "boolean") {
            return res.status(400).json({
                msg: "Invalid status"
            });
        }
        updateFields.status = !status;
    }
    // Validate and add todo text to the updateFields if present
    if (todo !== undefined) {
        const todoText = todo.toString().trim();
        if (todoText.length === 0) {
            return res.status(400).json({
                msg: "Invalid todo text"
            });
        }
        updateFields.todo = todoText;
    }
    // Check if there's anything to update
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            msg: "No valid fields to update"
        });
    }
    // Perform the update
    const updatedTodo = await collection?.updateOne({ _id }, { $set: updateFields });
    res.status(200).json({
        updatedTodo: updatedTodo
    });
});
// PUT /todos Update Multiple Todo Statuses by IDs
exports.router.put('/todos', async (req, res) => {
    const collection = res.locals.collection;
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            msg: "No valid IDs provided to uodate.",
        });
    }
    const objectIds = ids.map((id) => new mongodb_1.ObjectId(id));
    const updatedResult = await collection.updateMany({ _id: { $in: objectIds } }, { $set: { status: status } });
    res.status(200).json({
        matchedCount: updatedResult.matchedCount,
        modifiedCount: updatedResult.modifiedCount,
        message: `${updatedResult.modifiedCount} todos updated.`,
    });
});
// router.put('/todos/:id', async (req: Request, res: Response) => {
//     const collection = getCollection()
//     // mongoDB requirement to handle ids
//     const _id = new ObjectId(req.params.id)
//     const { status } = req.body
//     if (typeof(status) !== "boolean") {
//         return res.status(400).json({
//             msg: "Invalid status"
//         })
//     }
//     const updatedTodo = await collection?.updateOne({ _id }, { $set: {status: !status } })
//     res.status(200).json({
//         updatedTodo: updatedTodo
//     })
// })
