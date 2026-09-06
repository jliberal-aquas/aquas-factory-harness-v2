import { z } from "zod";

const StopBase = z.object({
  session_id: z.string().min(1),
  cwd: z.string().min(1),

  stop_hook_active: z.boolean(),
  last_assistant_message: z.string(),

  agent_type: z.string().min(1).optional()
}).passthrough();

const MainStop = StopBase.extend({
  hook_event_name: z.literal("Stop")
});

const SubagentStop = StopBase.extend({
  hook_event_name: z.literal("SubagentStop"),

  agent_id: z.string().min(1),
  agent_type: z.string().min(1),
  agent_transcript_path: z.string().min(1)
});

export const AgentStop = z.discriminatedUnion(
  "hook_event_name",
  [
    MainStop,
    SubagentStop
  ]
);

export type AgentStop =
  z.infer<typeof AgentStop>;

export type MainStop =
  z.infer<typeof MainStop>;

export type SubagentStop =
  z.infer<typeof SubagentStop>;