import { Schema, model, models, type InferSchemaType } from "mongoose";

const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** "2026-W37" */
    isoWeek: { type: String, required: true },

    stats: {
      sessions: Number,
      plannedMin: Number,
      completedMin: Number,
      completionRate: Number,
      plannedTasks: Number,
      completedTasks: Number,
      reasonHistogram: { type: Schema.Types.Mixed, default: {} },
      dominantPattern: { type: String, default: null },
      multiplierBefore: Number,
      multiplierAfter: Number,
      utilizationBefore: Number,
      utilizationAfter: Number,
    },

    /** AI, constrained to the figures above. Null when it could not be produced. */
    narrative: { type: String, default: null },
    sealedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ReviewSchema.index({ userId: 1, isoWeek: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema>;
export const Review = models.Review || model("Review", ReviewSchema);
