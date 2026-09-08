import { z } from "zod";

/**
 * Model responses are untrusted input. Everything is parsed through Zod before
 * it reaches the database, and everything is presented to the user as an
 * editable draft rather than saved silently.
 */

/** Call site 1: direction text -> goal tree draft (REQ-002). */
export const goalTreeSchema = z.object({
  goals: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        category: z.string().max(40),
        quarterObjective: z.string().min(3).max(160),
        monthOutcome: z.string().min(3).max(160),
      }),
    )
    .max(5),
});
export type GoalTreeDraft = z.infer<typeof goalTreeSchema>;

export const goalTreeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["goals"],
  properties: {
    goals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "category", "quarterObjective", "monthOutcome"],
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          quarterObjective: { type: "string" },
          monthOutcome: { type: "string" },
        },
      },
    },
  },
} as const;

/** Call site 2: outcome -> tasks with draft estimates. */
export const taskBreakdownSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        minimumMin: z.number().int().min(5).max(240),
        targetMin: z.number().int().min(5).max(480),
        stretchMin: z.number().int().min(5).max(720),
      }),
    )
    .min(1)
    .max(6),
});
export type TaskBreakdown = z.infer<typeof taskBreakdownSchema>;

export const taskBreakdownJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["tasks"],
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "minimumMin", "targetMin", "stretchMin"],
        properties: {
          title: { type: "string" },
          minimumMin: { type: "integer" },
          targetMin: { type: "integer" },
          stretchMin: { type: "integer" },
        },
      },
    },
  },
} as const;

/** Call site 3: obstacle -> if-then implementation intention (REQ-034). */
export const ifThenSchema = z.object({
  cue: z.string().min(5).max(160),
  response: z.string().min(5).max(200),
});

export const ifThenJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["cue", "response"],
  properties: {
    cue: { type: "string" },
    response: { type: "string" },
  },
} as const;
