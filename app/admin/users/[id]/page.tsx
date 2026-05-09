export const dynamic = "force-dynamic";
import UserEditClient from "./UserEditClient";

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserEditClient id={id} />;
}
