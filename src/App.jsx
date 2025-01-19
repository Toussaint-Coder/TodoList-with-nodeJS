/** @format */

import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTodoId, setEditedTodoId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTodo = {
      name,
      description,
    };

    try {
      if (isEditing) {
        // Optimistically update UI first
        const updatedTodos = todos.map((todo) =>
          todo.id === editedTodoId ? { ...todo, ...newTodo } : todo
        );
        setTodos(updatedTodos);

        // Then make API call
        const response = await axios.patch(
          `http://localhost:1234/api/v1/updateTodo/${editedTodoId}`,
          newTodo
        );

        // Update with server response if needed
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === editedTodoId ? response.data.data.todo : todo
          )
        );
      } else {
        // Optimistically add new todo with temporary ID
        const tempTodo = {
          id: Date.now(), // temporary ID
          ...newTodo,
        };
        setTodos((prevTodos) => [...prevTodos, tempTodo]);

        // Then make API call
        const response = await axios.post(
          "http://localhost:1234/api/v1/addTodo",
          newTodo
        );

        // Replace temporary todo with server response
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === tempTodo.id ? response.data.data.todo : todo
          )
        );
      }

      // Reset form
      setName("");
      setDescription("");
      setIsEditing(false);
      setEditedTodoId(null);
    } catch (err) {
      console.error("Error handling todo:", err.message);
      // Revert optimistic update if needed
      if (isEditing) {
        const response = await axios.get(
          "http://localhost:1234/api/v1/getAllTodos"
        );
        setTodos(response.data.data.todos);
      }
    }
  };

  const handleEdit = (todo) => {
    setIsEditing(true);
    setEditedTodoId(todo.id);
    setName(todo.name);
    setDescription(todo.description);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Do you want to delete this todo?");
    if (confirmed) {
      try {
        // Optimistically remove todo
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

        // Then make API call
        await axios.delete(`http://localhost:1234/api/v1/deleteTodo/${id}`);
        alert("Deleted successfully");
      } catch (err) {
        // Revert on error
        alert(err.message);
        const response = await axios.get(
          "http://localhost:1234/api/v1/getAllTodos"
        );
        setTodos(response.data.data.todos);
      }
    }
  };

  const handleCompleted = async (id) => {
    try {
      // Optimistically update UI
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: true } : todo
        )
      );

      // Then make API call
      const response = await axios.patch(
        `http://localhost:1234/api/v1/updateTodo/${id}`,
        { isCompleted: true }
      );

      // Update with server response if needed
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? response.data.data.todo : todo
        )
      );
    } catch (err) {
      console.error("Error updating todo:", err.message);
      // Revert optimistic update
      const response = await axios.get(
        "http://localhost:1234/api/v1/getAllTodos"
      );
      setTodos(response.data.data.todos);
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1234/api/v1/getAllTodos"
        );
        setTodos(response.data.data.todos);
      } catch (err) {
        console.error("Error fetching todos:", err.message);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg p-8 border flex gap-8">
        <div className="flex-1">
          <h1 className="text-center text-xl font-bold">Todo with nodeJS</h1>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2 mt-8">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <span>Todo Name</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Todo Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2 mt-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <span>Description</span>
              </label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                value={description}
                className="w-full border p-4 h-52 rounded-lg resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <span>{isEditing ? "Update Todo" : "Save Todo"}</span>
            </button>
          </form>
        </div>
        <div className="mt-8 flex-1">
          <h1 className="text-2xl font-bold mb-4">Todos</h1>
          <div className="space-y-4">
            {todos.length === 0 ? (
              <p className="text-lg text-center">No todos yet!</p>
            ) : (
              todos.map(
                (todo) =>
                  !todo.isCompleted && (
                    <>
                      {" "}
                      <div
                        key={todo.id}
                        className="space-y-2 border p-4 rounded-lg">
                        <h1 className="text-xl">{todo.name}</h1>
                        <p>{todo.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(todo)}
                            className="bg-yellow-500 text-white px-4 py-1 text-xs rounded-md hover:bg-yellow-600">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className="bg-red-500 text-white px-4 py-1 text-xs rounded-md hover:bg-red-600">
                            Delete
                          </button>
                          {!todo.isCompleted && (
                            <button
                              onClick={() => handleCompleted(todo.id)}
                              className="bg-green-500 text-white px-4 py-1 text-xs rounded-md hover:bg-green-600">
                              Complete
                            </button>
                          )}
                        </div>
                      </div>{" "}
                    </>
                  )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
