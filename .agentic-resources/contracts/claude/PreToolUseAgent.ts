import { z } from "zod";

export const PreToolUseAgent = z.object({
  session_id: z.string().min(1),
  prompt_id: z.string().min(1).optional(),
  hook_event_name: z.literal("PreToolUse"),
  agent_type: z.string().optional(),
  tool_name: z.literal("Agent"),
  tool_use_id: z.string().min(1),
  tool_input: z.object({
    subagent_type: z.string().min(1),
    prompt: z.string().min(1),
  }).passthrough(),
}).passthrough();

export type PreToolUseAgent =
  z.infer<typeof PreToolUseAgent>;