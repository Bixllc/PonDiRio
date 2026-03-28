import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-8">
          <span className="text-lg font-semibold text-gray-900">Pon Di Rio Admin</span>
          <div className="flex gap-6 text-sm">
            <Link href="/admin/bookings" className="text-gray-600 hover:text-gray-900">
              Bookings
            </Link>
            <Link href="/admin/availability" className="text-gray-600 hover:text-gray-900">
              Availability
            </Link>
            <Link href="/admin/calendar-feeds" className="text-gray-600 hover:text-gray-900">
              Calendar Feeds
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
