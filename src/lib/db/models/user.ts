import { Schema, model, models, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    timezone: { type: String, default: "UTC" },
    occupation: { type: String, default: "" },

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
