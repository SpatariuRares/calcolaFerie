import { calculatePlan, type EngineOutput, type UserConfig } from "@engine";
import { buildEngineInput } from "./engine-input";

type CalculatePlan = typeof calculatePlan;

export interface CalculationState {
  input: ReturnType<typeof buildEngineInput>;
  output: EngineOutput;
}

export function calculateVacationPlan(
  config: UserConfig,
  today = new Date(),
  runCalculatePlan: CalculatePlan = calculatePlan
): CalculationState {
  const input = buildEngineInput(config, today);

  return {
    input,
    output: runCalculatePlan(input),
  };
}
