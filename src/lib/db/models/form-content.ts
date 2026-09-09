import { Schema, model, models } from "mongoose";

/**
 * Loose mapping onto an existing "formcontent" collection whose exact schema
 * is external to this app. `strict: false` and no required fields, since the
 * only contract we need is: a category field, and a name-ish field.
 */
const FormContentSchema = new Schema({}, { strict: false, collection: "formcontent" });

export const FormContent = models.FormContent || model("FormContent", FormContentSchema);
