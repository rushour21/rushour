import { Schema, model, models, type InferSchemaType } from "mongoose";
import { DEFAULT_WEIGHTS } from "@/lib/engine";
import { PRIOR_MULTIPLIER } from "@/lib/engine/calibration";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    timezone: { type: String, default: "UTC" },
    occupation: { type: String, default: "" },

    /** Fixed commitments, in hours per day. Drives the capacity window. */
    profile: {
      sleepTargetH: { type: Number, default: 7.5 },
      workH: { type: Number, default: 8 },
      commuteH: { type: Number, default: 1 },
      mealsH: { type: Number, default: 2 },
      lifeH: { type: Number, default: 2 },
    },

    planning: {
      utilization: { type: Number, default: 0.8 },
      multiplier: { type: Number, default: PRIOR_MULTIPLIER },
      multiplierN: { type: Number, default: 0 },
    },

    readinessWeights: {
      sleep: { type: Number, default: DEFAULT_WEIGHTS.sleep },
      energy: { type: Number, default: DEFAULT_WEIGHTS.energy },
      stress: { type: Number, default: DEFAULT_WEIGHTS.stress },
      recovery: { type: Number, default: DEFAULT_WEIGHTS.recovery },
    },

    /** Which onboarding stages are done. Stages 4-6 are derived, never asked. */
    onboarding: {
      identity: { type: Boolean, default: false },
      direction: { type: Boolean, default: false },
      constraints: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;
export const User = models.User || model("User", UserSchema);
