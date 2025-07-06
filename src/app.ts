import express, { Application, Request, Response } from "express";
import cors from "cors";
import notFound from "./app/errors/notFound";
import router from "./app/routes";
const app: Application = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Storage Management Server is running" });
});

app.use("/api/v1", router);

app.use(notFound);

export default app;
