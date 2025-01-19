/** @format */

const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const port = 1234;

//get all todos
app.get("/api/v1/getAllTodos", (req, res) => {
  fs.readFile(`${__dirname}/data/todos.json`, "utf-8", (err, data) => {
    if (err) {
      res.status(404).json({
        status: "not found",
        data: {
          message: "not todos found",
        },
      });
      return;
    }
    const todos = JSON.parse(data);
    res.status(200).json({
      status: "ok",
      data: {
        todos,
      },
    });
  });
});

//add a new todo
app.post("/api/v1/addTodo", (req, res) => {
  fs.readFile(`${__dirname}/data/todos.json`, "utf-8", (err, data) => {
    if (err) {
      res.status(404).json({
        status: "not found",
        data: {
          message: "not list of todos available",
        },
      });
      return;
    }
    const Todos = JSON.parse(data);
    const newId = Todos.length + 1;
    const newTodo = {
      id: newId,
      name: req.body.name,
      description: req.body.description,
      isComplented: false,
    };
    Todos.push(newTodo);
    fs.writeFile(
      `${__dirname}/data/todos.json`,
      JSON.stringify(Todos),
      (err) => {
        if (err) {
          res.status(400).json({
            status: "failed",
            data: {
              message: "could not add Todo",
            },
          });
          return;
        }
        res.status(201).json({
          status: "success",
          data: {
            message: "add successfully",
          },
        });
      }
    );
  });
});

// update todo
app.patch("/api/v1/updateTodo/:id", (req, res) => {
  fs.readFile(`${__dirname}/data/todos.json`, "utf-8", (err, data) => {
    if (err) {
      res.status(404).json({
        status: "fail",
        data: {
          message: "no list of todos available",
        },
      });
      return;
    }

    const Todos = JSON.parse(data);
    const todoId = parseInt(req.params.id, 10);
    const todoIndex = Todos.findIndex((todo) => todo.id === todoId);

    if (todoIndex === -1) {
      res.status(404).json({
        status: "fail",
        data: {
          message: "todo not found",
        },
      });
      return;
    }

    const updatedTodo = {
      ...Todos[todoIndex],
      name: req.body.name || Todos[todoIndex].name,
      description: req.body.description || Todos[todoIndex].description,
      isCompleted:
        req.body.isCompleted !== undefined
          ? req.body.isCompleted
          : Todos[todoIndex].isCompleted,
    };

    Todos[todoIndex] = updatedTodo;

    fs.writeFile(
      `${__dirname}/data/todos.json`,
      JSON.stringify(Todos),
      (err) => {
        if (err) {
          res.status(500).json({
            status: "failed",
            data: {
              message: "could not save the updated todo",
            },
          });
          return; // Return to avoid sending multiple responses
        }
        res.status(200).json({
          status: "success",
          data: {
            todo: updatedTodo,
          },
        });
      }
    );
  });
});

//delete todo
app.delete("/api/v1/deleteTodo/:id", (req, res) => {
  fs.readFile(`${__dirname}/data/todos.json`, "utf-8", (err, data) => {
    if (err) {
      res.status(404).json({
        status: "fail",
        data: {
          message: "no list of todos available",
        },
      });
      return;
    }

    const Todos = JSON.parse(data);
    const todoId = parseInt(req.params.id, 10);
    const todoIndex = Todos.findIndex((todo) => todo.id === todoId);

    if (todoIndex === -1) {
      res.status(404).json({
        status: "fail",
        data: {
          message: "todo not found",
        },
      });
      return;
    }

    Todos.splice(todoIndex, 1);

    fs.writeFile(
      `${__dirname}/data/todos.json`,
      JSON.stringify(Todos),
      (err) => {
        if (err) {
          res.status(500).json({
            status: "failed",
            data: {
              message: "could not delete the todo",
            },
          });
          return;
        }
        res.status(204).json({
          status: "success",
          data: null,
        });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`listening to port : ${port}`);
});
