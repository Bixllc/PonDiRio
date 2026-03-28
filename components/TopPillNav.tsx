"use client";

import Link from "next/link";
import Image from "next/image";

export default function TopPillNav() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex h-14 items-center gap-6 rounded-full border border-white/20 bg-white/80 backdrop-blur-xl px-4 sm:px-6 shadow-lg">
        {/* Brand */}
        <Link href="#" className="flex items-center gap-3 pr-3 sm:pr-4 border-r border-black/10">
          <Image
            src="/logo.png"
            alt="Pon Di Rio"
            width={28}
            height={28}
            className="rounded-full"
            priority
          />
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-black">Pon Di Rio</p>
            <p className="text-[11px] text-black/70">Luxury Riverside Villas</p>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-black/80">
          <a href="#villas" className="hover:text-black">Villas</a>
          <a href="#amenities" className="hover:text-black">Amenities</a>
          {/* <a href="#experience" className="hover:text-black">Experience</a> */}
          <a href="#contact" className="hover:text-black">Contact</a>
        </nav>

        {/* CTA (mobile visible too) */}
        <a
          href="#contact"
          className="ml-auto inline-flex h-9 items-center rounded-full bg-black px-4 text-xs sm:text-sm font-medium text-white hover:bg-black/90"
        >
          Reserve
        </a>
      </div>
    </div>
  );
}
