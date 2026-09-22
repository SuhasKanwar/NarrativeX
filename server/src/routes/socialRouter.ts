import { Router } from "express";
import { searchSocialHandler } from "../controllers/socialController";

const socialRouter = Router();

socialRouter.post("/search", searchSocialHandler);

export default socialRouter;
