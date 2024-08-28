import { useEffect, useState } from "react"
import Todo, { TodoI } from "./compoents/Todo"

const App = () => {
  const [todos, setTodos] = useState<TodoI[]>([])
  const [content, setContent] = useState("")

  useEffect(() => {
    const getTodos = async () => {
      try {
        const res: Response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos`);

        if (!res.ok) {
          throw new Error(`HTTP Error: Status: ${res.status}`)
        }

        const todos: TodoI[]= await res.json()

        setTodos(todos)
        // console.log(todos);

      } catch (error) {
        console.log("Error fetching Todos:", error)
      }
      
    }
    
    getTodos()
  }, [])

  const createNewTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    // to avoid refreshing the page on form submission
    e.preventDefault()

    if (content.length > 3) {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos`, {
        method: "POST",
        body: JSON.stringify({
          todo: content
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const newTodo: TodoI = await res.json()

      setContent("")

      setTodos([...todos, newTodo])
    }
  }

  return (
    <main className="main-container">
      <h1>Full Stack MERN Todo App</h1>
      <form className="todo_form" onSubmit={createNewTodo}>
        <input 
          className="todo_form__input"
          type="text" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter a new todo..."
          required
        />
        <button className="create_todo_btn" type="submit">Create Todo</button>
      </form>
      <div className="todos">
        {todos.length > 0 &&    
          // <pre>{JSON.stringify(todos, null, 2)}</pre>                      
          todos.map(todo => (
            <Todo key={todo._id} todo={todo} setTodos={setTodos} />
          ))
        }
      </div>          
    </main>
  )
}

export default App
