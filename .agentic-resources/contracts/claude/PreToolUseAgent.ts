import { z } from "zod";

export const PreToolUseAgent = z.object({
  session_id: z.string().min(1),
  prompt_id: z.string().min(1).optional(),
  cwd: z.string().min(1),

  hook_event_name: z.literal("PreToolUse"),
  agent_type: z.string().min(1).optional(),
  tool_name: z.literal("Agent"),
  tool_use_id: z.string().min(1),

  tool_input: z.object({
    subagent_type: z.string().min(1),
    prompt: z.string().min(1),
    model: z.string().min(1).optional(),
  }).passthrough(),
}).passthrough();

export type PreToolUseAgent =
  z.infer<typeof PreToolUseAgent>;