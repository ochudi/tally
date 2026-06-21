import type { Request, Response } from "express";
import { PromotionQuery } from "@tally/shared";
import { getPromotion, listPromotions } from "../services/promotionService.js";
import { notFound } from "../lib/httpError.js";

// GET /promotions: validate and clamp the query, then return the shared list
// envelope. A ZodError here (e.g. an unparseable date) becomes a 400 in the
// error middleware; bad pagination is clamped by the schema, not rejected.
export async function getPromotions(req: Request, res: Response): Promise<void> {
  const query = PromotionQuery.parse(req.query);
  res.json(await listPromotions(query));
}

// GET /promotions/:id: one promotion or a typed 404.
export async function getPromotionById(
  req: Request,
  res: Response,
): Promise<void> {
  const id = req.params.id ?? "";
  const promotion = await getPromotion(id);
  if (!promotion) throw notFound(`No promotion with id ${id}`);
  res.json(promotion);
}
