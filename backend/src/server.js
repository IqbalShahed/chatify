import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from '../src/routes/auth.route.js';
import messageRoutes from '../src/routes/message.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';

const app = express();
const port = ENV.PORT;
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

app.use(express.json()); //req.body
app.use("/api/auth", authRoutes);
app.use("/api/", messageRoutes);

// make ready for development
if (ENV.NODE_ENV === "production") {
    const frontendPath = path.join(_dirname, "../../frontend/dist");
    app.use(express.static(frontendPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    })
}

app.listen(port, () => {
    console.log("App is running on port ", port)
    connectDB();
});