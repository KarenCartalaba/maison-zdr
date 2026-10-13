import UsersContent from "@/components/features/admin/UsersContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminUsersPage() {
  const res = await serverFetchAuth("/api/admin/v1/users");

  return (
    <UsersContent
      initialUsers={res.data?.users ?? null}
      initialStats={res.data?.stats ?? null}
    />
  );
}
