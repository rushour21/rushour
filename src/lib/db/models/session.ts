import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * The Day Session: the boundary object the whole system hangs off.
 *
 * It is the unit of planning, of measurement and of review. `localDate` makes
 * "today" a calendar question rather than a UTC range, so travel and DST stop
 * mattering. The `plan` sub-document is sealed on clock-out and never mutated -
 * the gap between plan and actual IS the product, and a mutable plan erases its
 * own evidence.
 */

const PlanItemSchema = new Schema(
  {
    nodeId: { type: Schema.Types.ObjectId, ref: "Node", required: true },
    title: { type: String, required: true },
    estimateTarget: { type: Number, required: true },
    estimateMinimum: { type: Number, required: true },
    weight: { type: Number, default: 3 },
    goalId: { type: Schema.Types.ObjectId, default: null },
    dueAt: { type: Date, default: null },
  },
  { _id: false },
);

const SegmentSchema = new Schema(
  {
    nodeId: { type: Schema.Types.ObjectId, ref: "Node", required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    lastHeartbeat: { type: Date, default: null },
    suspect: { type: Boolean, default: false },
  },
  { _id: true },
);

const ActualSchema = new Schema(
  {
    nodeId: { type: Schema.Types.ObjectId, ref: "Node", required: true },
    actualMin: { type: Number, default: 0 },
    tierReached: {
      type: String,
      enum: ["none", "minimum", "target", "stretch"],
      default: "none",
    },
    reason: {
      type: String,
      enum: [
        "overscheduled",
        "unexpected",
        "distracted",
        "low_energy",
        "underestimated",
        "blocked",
        "procrastinated",
        null,
      ],
      default: null,
    },
  },
  { _id: false },
);

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** "2026-09-08" in the user's timezone. The day boundary. */
    localDate: { type: String, required: true },

    state: {
      type: String,
      enum: ["OPEN", "PAUSED", "CLOSED", "AUTO_CLOSED"],
      default: "OPEN",
    },

    clockInAt: { type: Date, required: true },
    plannedClockOutAt: { type: Date, required: true },
    clockOutAt: { type: Date, default: null },
    closedBy: { type: String, enum: ["user", "auto", null], default: null },

    readiness: {
      sleepH: Number,
      energy: Number,
      stress: Number,
      score: Number,
      band: { type: String, enum: ["HIGH", "MEDIUM", "LOW"] },
    },

    capacity: {
      windowMin: Number,
      fixedMin: Number,
      bufferMin: Number,
      availableMin: Number,
      demandMin: Number,
      verdictMin: Number,
    },

    plan: {
      outcome: { type: String, default: "" },
      outcomeNodeId: { type: Schema.Types.ObjectId, default: null },
      items: { type: [PlanItemSchema], default: [] },
      committedAt: { type: Date, default: null },
    },

    segments: { type: [SegmentSchema], default: [] },
    actuals: { type: [ActualSchema], default: [] },

    tomorrow: { type: String, default: "" },
    /** False on an auto-closed session: it is excluded from calibration. */
    reviewed: { type: Boolean, default: false },
    /** True when re-entry after a 3+ day gap applied the reduced ceiling. */
    reentry: { type: Boolean, default: false },
    rescueOfferedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

SessionSchema.index({ userId: 1, localDate: 1 }, { unique: true });
SessionSchema.index({ userId: 1, state: 1 });

export type SessionDoc = InferSchemaType<typeof SessionSchema>;
export const SessionModel = models.Session || model("Session", SessionSchema);
