import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * One collection for year -> quarter -> month -> week -> day -> task.
 *
 * Five collections would turn every progress rollup into a five-way join,
 * which is what Mongo is worst at. A materialised `path` of ancestor ids makes
 * both directions - rollup and ancestor chain - a single indexed query.
 */
const NodeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["year", "quarter", "month", "week", "day", "task"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "" },

    parentId: { type: Schema.Types.ObjectId, ref: "Node", default: null },
    path: { type: [Schema.Types.ObjectId], default: [] },

    status: {
      type: String,
      enum: ["active", "later", "done", "parked", "cancelled"],
      default: "active",
    },
    weight: { type: Number, min: 1, max: 5, default: 3 },

    /** Write-once. Overwriting this makes calibration impossible. */
    estimateMin: {
      minimum: { type: Number, default: 0 },
      target: { type: Number, default: 0 },
      stretch: { type: Number, default: 0 },
    },
    actualMin: { type: Number, default: 0 },
    /** Truncated or auto-closed timings never feed calibration. */
    suspect: { type: Boolean, default: false },

    ifThen: {
      cue: { type: String, default: "" },
      response: { type: String, default: "" },
    },

    dueAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    /** Set when a goal is parked, so reactivation within 7 days is undo, not churn. */
    parkedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

NodeSchema.index({ userId: 1, type: 1, status: 1 });
NodeSchema.index({ userId: 1, path: 1 });
NodeSchema.index({ userId: 1, dueAt: 1 });

export type NodeDoc = InferSchemaType<typeof NodeSchema>;
export const NodeModel = models.Node || model("Node", NodeSchema);
