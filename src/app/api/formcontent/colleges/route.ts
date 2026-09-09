import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/client";
import { FormContent } from "@/lib/db/models/form-content";

/**
 * GET /api/formcontent/colleges
 *
 * Reads the "formcontent" collection, filters to category "college(s)", and
 * returns just the college names.
 *
 * The real field names in that collection aren't known here, so this is
 * defensive on both sides:
 *  - category match is case-insensitive and accepts "college" or "colleges"
 *  - the name is read from whichever of a few likely fields is present
 *    (name, collegeName, college_name, title), so this keeps working even if
 *    the field is spelled differently than expected.
 */
export async function GET() {
  await connectDb();

  const docs = await FormContent.find({ category: { $regex: /^colleges?$/i } })
    .lean()
    .exec();

  const colleges = docs
    .map((d) => {
      const doc = d as Record<string, unknown>;
      const name = doc.name ?? doc.collegeName ?? doc.college_name ?? doc.title;
      return typeof name === "string" ? name.trim() : null;
    })
    .filter((name): name is string => Boolean(name));

  return NextResponse.json({ count: colleges.length, colleges });
}
