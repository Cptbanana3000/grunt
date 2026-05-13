import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await admin
    .from("profiles")
    .select("plan, daily_compressions, last_compression_date, total_compressions")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const usedToday = profile.last_compression_date === today ? profile.daily_compressions : 0;

  return NextResponse.json({
    plan: profile.plan,
    usedToday,
    stats: { totalCompressions: profile.total_compressions },
  });
}
