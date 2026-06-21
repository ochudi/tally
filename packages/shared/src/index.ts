// Placeholder export so both apps import a real value and real types from the
// built package. The Zod schemas and their z.infer types replace this in the
// schema phase; everything downstream derives from here.
export const SHARED_PACKAGE = "@tally/shared" as const;

export type Health = {
  ok: boolean;
  service: string;
};
