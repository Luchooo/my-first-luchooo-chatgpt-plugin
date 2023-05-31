import express, { json } from "express";
import cors from "cors";

// fs -> file system -> sistema de archivos (Solo vamos a leer)
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const PORT = process.env.PORT ?? 3000;
const app = express();

// Handle cors requests
app.use(
  cors({
    origin: [`https://localhost:${PORT}`],
  })
);

// Add middlewares
app.use(json());

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Servir archivos estaticos para el Plugin ChatGPT

app.get("/openapi.yaml", async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "openapi.yaml");
    const yamlData = await fs.readFile(filePath, "utf-8");
    res.setHeader("Content-Type", "text/yaml");
    res.send(yamlData);
  } catch (e) {
    console.error(e);
    res.status(500).send("Unable fetch openapi.yaml file");
  }
});

app.get("/.well-know/ai-plugin.json", async (req, res) => {
  res.sendFile(path.join(process.cwd(), ".well-know/ai-plugin.json"));
});

app.get("/logo.png", async (req, res) => {
  res.sendFile(path.join(process.cwd(), "logo.png"));
});

// Endpoints
let TODOS = [
  { id: crypto.randomUUID(), title: "Ver stream midu.dev" },
  { id: crypto.randomUUID(), title: "Crear pagina orangebot.app" },
  { id: crypto.randomUUID(), title: "Comprar pan" },
];

console.log(TODOS);

app.get("/todos", (req, res) => {
  return res.json({ todos: TODOS });
});

app.post("/todos", (req, res) => {
  const { title } = req.body;
  const newTodo = { id: crypto.randomUUID(), title };
  TODOS.push(newTodo);
  return res.json(newTodo);
});

app.get("/todos/:id", (req, res) => {
  const { id } = req.params;
  const todo = TODOS.find((todo) => todo.id === id);
  return res.json(todo);
});

app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  let newTodo = null;

  TODOS = TODOS.map((todo) => {
    if (todo.id === id) {
      newTodo = { ...todo, title };
      return newTodo;
    }
    return todo;
  });

  return res.json(newTodo);
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;

  TODOS = TODOS.filter((todo) => todo.id !== id);
  return res.json({ ok: true });
});

// Run the server
app.listen(PORT, () => {
  console.log(`ChatGPT Plugin is listening on port ${PORT}`);
});
