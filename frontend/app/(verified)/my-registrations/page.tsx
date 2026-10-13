import { redirect } from "next/navigation";

/**
 * "My Registrations" no longer has a dedicated page: it now lives in
 * Profile → My Events (same registrations data, single place to manage them).
 * Old links / bookmarks are redirected instead of landing on a dead route.
 */
export default function MyRegistrationsPage() {
  redirect("/profile?tab=events");
}
