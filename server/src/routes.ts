import express, { Router, Request, Response } from "express"
import { getConnectedClient, connectToMogoDB } from "./database"
import { ObjectId } from "mongodb"

export const router: Router = express.Router()

const getCollection = async () => {
    await connectToMogoDB()
    const client = getConnectedClient()
    const collection = client?.db("todosdb").collection("todos")

    return collection
}

// GET /todos
router.get('/todos', async (req: Request, res: Response) => {
    const collection = await getCollection()
    const todos = await collection?.find({}).toArray()

    res.status(200).json(todos)
})

// POST /todos
router.post('/todos', async (req: Request, res: Response) => {
    const collection = await getCollection()
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

// DELETE /todos/:id
router.delete('/todos/:id', async (req: Request, res: Response) => {
    const collection = await getCollection()

    // mongoDB requirement to handle ids
    const _id = new ObjectId(req.params.id)

    const deletedTodo = await collection?.deleteOne({ _id: _id })

    res.status(200).json({
        deletedTodo: deletedTodo
    })
})

// PUT /todos/:id
router.put('/todos/:id', async (req: Request, res: Response) => {
    const collection = await getCollection();

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