import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callLogId, endTime, durationSeconds, notes, transcript } = body;
    const updated = await db.callLog.update({
      where: { id: callLogId },
      data: {
        endTime: new Date(endTime),
        durationSeconds,
        notes,
        transcript,
      },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
