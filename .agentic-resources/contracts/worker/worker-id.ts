import { z } from "zod";

export const WorkerId = z.enum([
  "researcher",
  "builder",
  "verifier",
  "recorder",
  "committer",
]);

export type WorkerId =
  z.infer<typeof WorkerId>;