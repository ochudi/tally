import type { Request, Response } from "express";
import { listBrands } from "../services/brandService.js";

// GET /brands: all brands with metadata and promotionCount.
export async function getBrands(_req: Request, res: Response): Promise<void> {
  res.json(await listBrands());
}
