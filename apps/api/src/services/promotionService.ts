import { Prisma } from "@prisma/client";
import {
  PromotionList,
  type PromotionList as PromotionListShape,
  type Promotion as PromotionShape,
  type PromotionQuery,
} from "@tally/shared";
import { prisma } from "../db/client.js";
import { rowToPromotion } from "../db/mapper.js";

const insensitive = Prisma.QueryMode.insensitive;

// Build the Prisma filter from validated query params. search matches the promo
// or brand name; brand matches a slug exactly or a name loosely; the date params
// filter by overlap with the promotion's validity window, treating a null bound
// as open-ended.
function buildWhere(q: PromotionQuery): Prisma.PromotionWhereInput {
  const and: Prisma.PromotionWhereInput[] = [];

  if (q.search) {
    and.push({
      OR: [
        { name: { contains: q.search, mode: insensitive } },
        { brand: { name: { contains: q.search, mode: insensitive } } },
      ],
    });
  }

  if (q.brand) {
    and.push({
      brand: {
        OR: [
          { slug: q.brand },
          { name: { contains: q.brand, mode: insensitive } },
        ],
      },
    });
  }

  // Promo window [startDate, endDate] overlaps the query window [from, to]. A
  // null promo bound is treated as open (always overlapping on that side).
  if (q.startDate) {
    and.push({ OR: [{ endDate: null }, { endDate: { gte: q.startDate } }] });
  }
  if (q.endDate) {
    and.push({ OR: [{ startDate: null }, { startDate: { lte: q.endDate } }] });
  }

  return and.length ? { AND: and } : {};
}

export async function listPromotions(
  q: PromotionQuery,
): Promise<PromotionListShape> {
  const where = buildWhere(q);
  const skip = (q.page - 1) * q.pageSize;

  const [rows, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      include: { brand: true },
      // Soonest-ending first, undated last, then by name for a stable order.
      orderBy: [{ endDate: { sort: "asc", nulls: "last" } }, { name: "asc" }],
      skip,
      take: q.pageSize,
    }),
    prisma.promotion.count({ where }),
  ]);

  // Validate the whole envelope against the shared schema before returning.
  return PromotionList.parse({
    data: rows.map(rowToPromotion),
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.ceil(total / q.pageSize),
  });
}

export async function getPromotion(id: string): Promise<PromotionShape | null> {
  const row = await prisma.promotion.findUnique({
    where: { id },
    include: { brand: true },
  });
  return row ? rowToPromotion(row) : null;
}
