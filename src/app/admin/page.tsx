import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function AdminIndexPage() {
  const currentUser = await getCurrentUser();
  redirect(currentUser?.role === "admin" ? "/admin/dashboard" : "/admin/login");
}
