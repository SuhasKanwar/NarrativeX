import { Router } from "express";
import { getGeopoliticalEventsHandler } from "../controllers/eventsController";

const eventsRouter = Router();

eventsRouter.get("/geopolitics", getGeopoliticalEventsHandler);

export default eventsRouter;