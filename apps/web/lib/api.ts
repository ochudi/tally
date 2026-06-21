import {
  Brand,
  PromotionList,
  type Brand as BrandShape,
  type PromotionList as PromotionListShape,
} from "@tally/shared";

// The API runs on its own port; server components fetch it directly. Overridable
// for other environments.
const API_URL = process.env.API_URL ?? "http://localhost:4000";

export type ListParams = {
  q?: string;
  date?: string;
  page?: number;
  pageSize?: number;
};

// Translate the UI's params into the API's query and fetch a page of promotions.
// A single "active on" date maps to both bounds of the validity-window filter.
export async function fetchPromotions(
  params: ListParams,
): Promise<PromotionListShape> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("search", params.q);
  if (params.date) {
    qs.set("startDate", params.date);
    qs.set("endDate", params.date);
  }
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 12));

  const res = await fetch(`${API_URL}/promotions?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`promotions request failed (${res.status})`);
  return PromotionList.parse(await res.json());
}

export async function fetchBrands(): Promise<BrandShape[]> {
  const res = await fetch(`${API_URL}/brands`, { cache: "no-store" });
  if (!res.ok) throw new Error(`brands request failed (${res.status})`);
  return Brand.array().parse(await res.json());
}
