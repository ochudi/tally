import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getBrands } from "../controllers/brandController.js";
import {
  getPromotionById,
  getPromotions,
} from "../controllers/promotionController.js";
import { getScrape, postScrape } from "../controllers/scrapeController.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "@tally/api" });
});

router.get("/promotions", asyncHandler(getPromotions));
router.get("/promotions/:id", asyncHandler(getPromotionById));
router.get("/brands", asyncHandler(getBrands));

router.post("/scrape", asyncHandler(postScrape));
router.get("/scrape/:jobId", asyncHandler(getScrape));
