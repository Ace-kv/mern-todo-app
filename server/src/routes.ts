import express, { Router, Request, Response, NextFunction } from "express"
import { getConnectedClient, connectToMogoDB } from "./database"
import { Collection, ObjectId } from "mongodb"

export const router: Router = express.Router()

// Middleware to CONNECT to the database ONCE, get the collection, and pass the collection to res.locals for temporary data
// i.e. any data that needs to be passed between middleware functions and route handlers only for the duration of a single request.
// Examples include a MongoDB collection reference, user authentication data, or any state needed only for the current HTTP request.
const getCollectionMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectToMogoDB()
        const client = getConnectedClient()
        const collection = client?.db("todosdb").collection("todos")

        if (!collection) {
            return res.status(500).json({
                msg: "Failed to get the collection",
            })
        }

        res.locals.collection = collection              // Store collection in res.locals
        next()  // Continue to the next middleware or route handler

    } catch (error) {
        // Handle unknown error type safely
    if (error instanceof Error) {
        res.status(500).json({ 
            msg: "Database connection error", 
            error: error.message 
        });
    } else {
        res.status(500).json({ 
            msg: "Unknown error occurred" 
        });
    }
    }
}

// Apply the middleware to use the collection in all routes
router.use(getCollectionMiddleWare)

// GET /todos
router.get('/todos', async (req: Request, res: Response) => {
    const collection: Collection = res.locals.collection           // Access the collection from res.locals
    const todos = await collection?.find({}).toArray()

    res.status(200).json(todos)
})

// POST /todos
router.post('/todos', async (req: Request, res: Response) => {
    const collection: Collection = res.locals.collection
    const { todo } = req.body

    if (!todo) {
        return res.status(400).json({
            msg: "No Todo found"
        })
    }

    const newTodo = await collection?.insertOne({
        todo: typeof(todo) !== "string" ? JSON.stringify(todo) : todo, 
        status: false
    })

    res.status(201).json({
        todo: todo,
        status: false,
        _id: newTodo?.insertedId
    })
})

// DELETE /todos/:id - Delete a single todo by ID
router.delete('/todos/:id', async (req: Request, res: Response) => {
    const collection: Collection = res.locals.collection

    // mongoDB requirement to handle ids
    const _id = new ObjectId(req.params.id)

    const deletedTodo = await collection?.deleteOne({ _id: _id })

    res.status(200).json({
        deletedTodo: deletedTodo
    })
})

// DELETE /todos - Delete multiple todos by ID(s)
router.delete('/todos', async (req: Request, res: Response) => {
    const collection: Collection = res.locals.collection
    const { ids } = req.body

    if(!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            msg: "No valid IDs provided for deletion.",
        })
    }

    const objectIds = ids.map((id: string) => new ObjectId(id))
    const deleteResult = await collection.deleteMany({ _id: { $in: objectIds } })

    res.status(200).json({
        deletedCount: deleteResult.deletedCount,
        msg: `${deleteResult.deletedCount} todos deleted.`,
    })
})

// PUT /todos/:id
router.put('/todos/:id', async (req: Request, res: Response) => {
    const collection: Collection = res.locals.collection;

    // mongoDB requirement to handle ids
    const _id = new ObjectId(req.params.id);
    const { status, todo } = req.body;

    // Prepare the fields to update
    const updateFields: any = {};

    // Validate and add status to the updateFields if present
    if (status !== undefined) {
        if (typeof(status) !== "boolean") {
            return res.status(400).json({
                msg: "Invalid status"
            });
        }
        updateFields.status = !status;
    }

    // Validate and add todo text to the updateFields if present
    if (todo !== undefined) {

        const todoText = todo.toString().trim()

        if (todoText.length === 0) {
            return res.status(400).json({
                msg: "Invalid todo text"
            });
        }
        updateFields.todo = todoText
    }

    // Check if there's anything to update
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            msg: "No valid fields to update"
        });
    }

    // Perform the update
    const updatedTodo = await collection?.updateOne(
        { _id }, 
        { $set: updateFields }
    );

    res.status(200).json({
        updatedTodo: updatedTodo
    });
});

// PUT /todos Update Multiple Todo Statuses by IDs
router.put('todos', async (req: Request, res: Response) => {
    const collection: Collection = res.locals.collection

    const { ids, status } = req.body

    if(!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            msg: "No valid IDs provided for deletion.",
        })
    }

    const objectIds = ids.map((id: string) => new ObjectId(id))
    const updatedResult = await collection.updateMany(
        { _id: { $in: objectIds } },
        { status: { $set: status } }
    )

    res.status(200).json({
        matchedCount: updatedResult.matchedCount,
        modifiedCount: updatedResult.modifiedCount,
        message: `${updatedResult.modifiedCount} todos updated.`,
    })

})


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