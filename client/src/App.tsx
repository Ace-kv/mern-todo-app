import { useEffect, useState } from "react"
import Todo, { TodoI } from "./compoents/Todo"

const App = () => {
  const [todos, setTodos] = useState<TodoI[]>([])
  const [content, setContent] = useState("")
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set())

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

  const handleSlectedTodos = (id: string, selected: boolean) => {
    // Avoid Stale State: When updating state based on previous values, using the functional update form ((prev) => ...) 
    // ensures that your updates are based on the most current state. This is important in React because state updates 
    // are asynchronous, and relying on an outdated state could lead to incorrect results.
    setSelectedTodos((currentState) => {
      const newSelected = new Set(currentState)
      if (selected) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }

      return newSelected
    })
  }

  const deleteSelectedTodos = async () => {
    const todosToDelete = Array.from(selectedTodos)

    if (todosToDelete.length === 0) return

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: todosToDelete
      })
    })

    const deleteRes = await res.json()

    if (deleteRes.deletedCount > 0) {
      setTodos((currentTodos) => currentTodos.filter((todo) => !selectedTodos.has(todo._id)))
      setSelectedTodos(new Set())
    }
  }

  const selectAllTodos = async () => {

    const changeBulkTodoStatus = async (status: boolean) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/todos`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: todos.map((todo) => todo._id),  // Send all todo IDs
            status: status,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to update todos: ${res.statusText}`);
        }

        const updateRes = await res.json();
        if (updateRes.modifiedCount > 0) {
          setTodos((currentTodos) =>
            currentTodos.map((todo) => ({ ...todo, status: status })) // Update status locally
          );
        }
      } catch (error) {
        console.error("Error updating todos:", error);
      }
    }

    // If all todos are selected, unselect all todos
    if (selectedTodos.size === todos.length) {
      setSelectedTodos(new Set())

      // Update status of all todos to false
      changeBulkTodoStatus(false)

    } else {
      // Otherwise, select all todos by adding all todo IDs to the set
      setSelectedTodos(new Set(todos.map((todo) => todo._id)))
      
      // Update status of all todos to true
      changeBulkTodoStatus(true)
      
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
      <div className="selAll-and-delSel-btn">
        <button
          className="selectAllBtn"
          onClick={selectAllTodos}
        >
          {todos.map((todo) => todo.status).includes(false) ? "☐" : "☑"}
        </button>
        {selectedTodos.size > 0 && (
          <button 
            className="delete-selected-todos-btn" 
            onClick={deleteSelectedTodos}
          >
            Delete Seclected Todos
          </button>
        )}
      </div>
      <div className="todos">
        {todos.length > 0 &&    
          // <pre>{JSON.stringify(todos, null, 2)}</pre>                      
          todos.map(todo => (
            <Todo key={todo._id} todo={todo} setTodos={setTodos} onSelect={handleSlectedTodos} />
          ))
        }
      </div>          
    </main>
  )
}

export default App
