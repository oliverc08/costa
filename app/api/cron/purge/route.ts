import { RETENTION_DAYS } from "@/lib/config";
import { getStore } from "@/lib/store";

/** Daily Vercel Cron: deletes conversations and resolved handoffs older than the retention window. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await getStore().purgeOlderThan(RETENTION_DAYS);
  console.info("[cron] purge", result);
  return Response.json({ ok: true, retentionDays: RETENTION_DAYS, deleted: result });
}
