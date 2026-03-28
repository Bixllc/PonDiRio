"use client";

import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Villas", href: "#villas" },
  { label: "Amenities", href: "#amenities" },
  // { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  return (
    <nav className="fixed top-6 left-6 right-6 z-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-lg">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Pon Di Rio" width={36} height={36} className="rounded-full" />
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-medium text-gray-900">Pon Di Rio</div>
              <div className="text-[11px] text-gray-500">Luxury Riverside Villas</div>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-[15px] text-gray-700">
            {links.map(l => (
              <a key={l.label} href={l.href} className="hover:text-black transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#contact"
            className="inline-flex h-9 items-center rounded-full border border-black/80 bg-white px-4 text-sm font-medium text-black hover:bg-white/90"
          >
            Reserve Now
          </a>
        </div>
      </div>
    </nav>
  );
}
