import { useEffect, useRef, useState } from "react"
import "./styles.css"

export interface TodoI {
    "_id": string,
    "todo": string,
    "status": boolean,
}

const Todo = ({ todo, setTodos }: { 
    todo: TodoI, 
    setTodos: React.Dispatch<React.SetStateAction<TodoI[]>>
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [newTodoText, setNewTodoText] = useState(todo.todo)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditing])

    const updateTodoStatus = async (todoId: string, todoStatus: boolean) => {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos/${todoId}`, {
            method: "PUT",
            body: JSON.stringify({
                status: todoStatus
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        const updateRes = await res.json()
        console.log(updateRes);
        

        if (updateRes.updatedTodo.acknowledged) {
            setTodos((currentTodos: TodoI[]) => (
                currentTodos.map((currentTodo: TodoI) => {
                    if (currentTodo._id === todoId) {
                        return {...currentTodo, status: !currentTodo.status}
                    }

                    return currentTodo
                })
            ))
        }
    }

    const updateTodoText = async (todoId: string, todoText: string) => {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos/${todoId}`, {
            method: "PUT",
            body: JSON.stringify({
                todo: todoText
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        const updateRes = await res.json()
        console.log(updateRes);
        

        if (updateRes.updatedTodo.acknowledged) {
            setTodos((currentTodos: TodoI[]) => (
                currentTodos.map((currentTodo: TodoI) => {
                    if (currentTodo._id === todoId) {
                        return {...currentTodo, todo: todoText}
                    }

                    return currentTodo
                })
            ))

            setIsEditing(false)
        }
    }

    const deleteTodo = async (todoId: string) => {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos/${todoId}`, {
            method: "DELETE",
        })

        const deleteRes = await res.json()

        if (deleteRes.deletedTodo.acknowledged) {
            setTodos((currentTodos: TodoI[]) => (
                currentTodos.filter((currentTodo: TodoI) => currentTodo._id !== todoId)
            ))
        }
    }

    return (
        <div className="todo">
            <div>
                <button 
                    className="todo__status"
                    onClick={() => updateTodoStatus(todo._id, todo.status)}
                >
                    {todo.status ? "☑" : "☐"}
                </button>
            </div>
            {isEditing ?
                <input 
                    className="todo_text_edit"
                    type="text" 
                    ref={inputRef}
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            updateTodoText(todo._id, newTodoText)
                        }
                    }}
                    onBlur={() => setIsEditing(false)}
                /> :
                <p className={todo.status ? 'todo__text line-through decoration-[1.5px]' : 'todo__text'}>{todo.todo}</p>
            }
            <div className="todo_edit_and_del">
                <button 
                    className="todo__edit"
                    onClick={() => setIsEditing(true)}
                >
                    ✏️
                </button>
                <button 
                    className="todo__delete"
                    onClick={() => deleteTodo(todo._id)}
                >
                    🗑️
                </button>
            </div>
        </div>
    )
}

export default Todo