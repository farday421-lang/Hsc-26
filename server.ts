import express from "express";
import { createServer as createViteServer } from "vite";
import yts from "yt-search";
import path from "path";
import fs from "fs";

console.log("Starting server process...");

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;
    
    app.use(express.json());

    console.log("Initializing Express app...");

    const DATA_FILE = path.join(process.cwd(), 'server-data.json');

    const readData = () => {
      if (!fs.existsSync(DATA_FILE)) return {};
      try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      } catch {
        return {};
      }
    };

    const writeData = (data: any) => {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    };

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    if (data[username]) {
      return res.status(400).json({ error: "User already exists" });
    }
    data[username] = {
      password,
      userData: {
        username,
        classes: [],
        totalStudyHours: 0,
        lastActiveDate: new Date().toISOString()
      }
    };
    writeData(data);
    res.json({ success: true, userData: data[username].userData });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    const user = data[username];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    res.json({ success: true, userData: user.userData });
  });

  app.get("/api/data", (req, res) => {
    const username = req.headers['x-user'] as string;
    const data = readData();
    if (!username || !data[username]) return res.status(404).json({ error: "Not found" });
    res.json(data[username].userData);
  });

  app.post("/api/data", (req, res) => {
    const username = req.headers['x-user'] as string;
    const userData = req.body;
    const data = readData();
    if (!username || !data[username]) return res.status(404).json({ error: "Not found" });
    data[username].userData = userData;
    writeData(data);
    res.json({ success: true });
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const r = await yts(query);
      const videos = r.videos.slice(0, 5); // Return top 5 results
      res.json({ videos });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
