import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { predictEmails } from "@/lib/pattern-predictor";

/**
 * POST /api/predict-emails — AI Pattern Detection and Email Prediction API
 * Body: { sampleEmailsText: string, namesText: string }
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sampleEmailsText, namesText } = body;

    if (!sampleEmailsText && !namesText) {
      return NextResponse.json(
        { error: "Provide sample emails text or names list text" },
        { status: 400 }
      );
    }

    const result = await predictEmails(sampleEmailsText || "", namesText || "");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Predict Emails API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to predict emails" },
      { status: 500 }
    );
  }
}
