import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPartner, partnerPasscode, usingDevPasscode } from "@/lib/partner-auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Partner sign-in · Costa", robots: { index: false } };

export default async function PartnerLogin() {
  if (await getPartner()) redirect("/partners");
  const enabled = partnerPasscode() !== null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-5 py-12">
      <div>
        <p className="flex items-center gap-2 text-lg font-bold text-pine-800">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-pine-700 text-sm text-white">
            C
          </span>
          Costa Partners
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Help requests dashboard</h1>
        <p className="mt-1 text-sm text-stone-600">For community organizations that follow up with Costa users.</p>
      </div>
      {enabled ? (
        <LoginForm devHint={usingDevPasscode() ? "costa-demo" : null} />
      ) : (
        <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">
          The dashboard is disabled. Set PARTNER_PASSCODE to enable it.
        </p>
      )}
    </main>
  );
}
