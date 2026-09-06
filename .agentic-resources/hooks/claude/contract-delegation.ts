import type {ZodType} from "zod";
import type {PreToolUseAgent} from "../../contracts/claude/PreToolUseAgent.ts";
import {InvalidPayloadError,parseJson} from "../common/json.ts";
import {validatePayload} from "../common/zod.ts";
import {allowAgentWithPrompt, denyPreToolUse} from "./responses.ts";
import {materializeContract} from "../../workers/materialize-contract.ts";
import {resolveProjectRoot} from "../common/project-root.ts";

export type DelegationContext = {
  projectRoot: string;
  sessionId: string;
  promptId?: string;
};


type ContractDelegationOptions<
  TDraft,
  TContract,
> = {
  input: PreToolUseAgent;

  label: string;

  draftSchema: ZodType<TDraft>;
  contractSchema: ZodType<TContract>;

  assertDelegation?: (
    input: PreToolUseAgent,
  ) => void;

  buildContract: (
    draft: TDraft,
    context: DelegationContext,
  ) => TContract | Promise<TContract>;

  pathFor: (
    contract: TContract,
  ) => string;

  toolInputOverrides?: (
    input: PreToolUseAgent,
    contract: TContract,
  ) => Record<string, unknown>;
};


export async function manageContractDelegation<
  TDraft,
  TContract,
>(
  options: ContractDelegationOptions<
    TDraft,
    TContract
  >,
): Promise<unknown> {

  try {
    options.assertDelegation?.(
      options.input,
    );

    const raw =
      parseJson(
        options.input.tool_input.prompt,
        options.label,
      );

    const draft =
      validatePayload(
        options.draftSchema,
        raw,
        options.label,
      );

    const projectRoot =
      resolveProjectRoot(
        options.input.cwd,
      );

    const contract =
      await options.buildContract(
        draft,
        {
          projectRoot,

          sessionId:
            options.input.session_id,

          promptId:
            options.input.prompt_id,
        },
      );

    const validatedContract =
      validatePayload(
        options.contractSchema,
        contract,
        options.label,
      );

    const materialized =
      await materializeContract({
        schema:
          options.contractSchema,

        contract:
          validatedContract,

        projectRoot,

        relativePath:
          options.pathFor(
            validatedContract,
          ),
      });

    const overrides =
      options.toolInputOverrides?.(
        options.input,
        validatedContract,
      ) ?? {};

    return allowAgentWithPrompt(
      options.input,
      materialized.path,
      overrides,
    );

  } catch (error) {
    if (
      error instanceof
      InvalidPayloadError
    ) {
      return denyPreToolUse(
        error.message,
      );
    }

    throw error;
  }
}