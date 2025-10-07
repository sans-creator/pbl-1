import express from "express";
import { getAuditoriums, addAuditorium } from "../controllers/auditoriumController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAuditoriums);
router.post("/", protect, admin, addAuditorium);

export default router;
