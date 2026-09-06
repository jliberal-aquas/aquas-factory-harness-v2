import { z } from "zod";

export const PreToolUse = z.object({
  session_id: z.string().min(1),
  prompt_id: z.string().min(1).optional(),
  cwd: z.string().min(1),

  hook_event_name: z.literal("PreToolUse"),

  agent_id: z.string().min(1).optional(),
  agent_type: z.string().min(1).optional(),

  tool_name: z.string().min(1),

  tool_input: z
    .object({})
    .catchall(z.unknown()),
}).passthrough();

export type PreToolUse =
  z.infer<typeof PreToolUse>;