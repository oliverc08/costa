import { cookies } from "next/headers";

/** "Delete everything on this phone": forget the anonymous chat session cookie. */
export async function DELETE() {
  const jar = await cookies();
  jar.delete("costa_sid");
  return new Response(null, { status: 204 });
}
