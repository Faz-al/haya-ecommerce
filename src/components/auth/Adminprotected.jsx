import AdminRoute from "./AdminRoute";

export default function AdminProtected({
  children,
}) {
  return (
    <AdminRoute>
      {children}
    </AdminRoute>
  );
}