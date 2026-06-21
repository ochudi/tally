import { z } from "zod";
import { Brand, type Brand as BrandShape } from "@tally/shared";
import { prisma } from "../db/client.js";
import { rowToBrand } from "../db/mapper.js";

const BrandList = z.array(Brand);

// Brands with their metadata and a promotionCount. The count is a Prisma
// aggregate via _count, not an N+1 loop over each brand.
export async function listBrands(): Promise<BrandShape[]> {
  const rows = await prisma.brand.findMany({
    include: { _count: { select: { promotions: true } } },
    orderBy: { name: "asc" },
  });
  return BrandList.parse(rows.map(rowToBrand));
}
