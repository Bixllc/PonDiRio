"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVillasOpen, setIsVillasOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowScrolledStyle = !isHomePage || isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 transition-all duration-300 ${
        shouldShowScrolledStyle
          ? "bg-white/95 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="text-2xl tracking-wide">
        <a href="/">
          <Image src="/logotransparent.png" alt="Pon Di Rio" width={64} height={64} className="h-16 w-auto" />
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        <a
          href="/#about"
          className={`transition-colors text-sm tracking-wide ${
            shouldShowScrolledStyle
              ? "text-gray-700 hover:text-gray-900"
              : "text-white/90 hover:text-white"
          }`}
        >
          About
        </a>

        {/* Villas Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setIsVillasOpen(true)}
          onMouseLeave={() => setIsVillasOpen(false)}
        >
          <button
            className={`flex items-center gap-1 transition-colors text-sm tracking-wide ${
              shouldShowScrolledStyle
                ? "text-gray-700 hover:text-gray-900"
                : "text-white/90 hover:text-white"
            }`}
          >
            Villas
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isVillasOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute top-full left-0 mt-2 w-48 bg-white shadow-lg transition-all duration-200 ${
              isVillasOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-2"
            }`}
          >
            <a
              href="/villas/palm-villa"
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Palm Villa
            </a>
            <a
              href="/villas/bamboo-villa"
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Bamboo Villa
            </a>
          </div>
        </div>

        <a
          href="/contact"
          className={`transition-colors text-sm tracking-wide ${
            shouldShowScrolledStyle
              ? "text-gray-700 hover:text-gray-900"
              : "text-white/90 hover:text-white"
          }`}
        >
          Contact
        </a>
      </nav>

      {/* Book Now Button (desktop only) */}
      <div className="hidden md:block">
        <Link href="/booking">
          <Button
            className={`transition-all px-6 shadow-none ${
              shouldShowScrolledStyle
                ? "bg-amber-600 hover:bg-amber-700 text-white border-0"
                : "bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20"
            }`}
          >
            Book Now
          </Button>
        </Link>
      </div>

      {/* Hamburger Button (mobile only) */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X
            className={`w-6 h-6 ${shouldShowScrolledStyle ? "text-gray-900" : "text-white"}`}
          />
        ) : (
          <Menu
            className={`w-6 h-6 ${shouldShowScrolledStyle ? "text-gray-900" : "text-white"}`}
          />
        )}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className={`absolute top-full left-0 right-0 md:hidden border-t transition-all duration-300 ${
            shouldShowScrolledStyle
              ? "bg-white/95 backdrop-blur-lg border-gray-200"
              : "bg-black/80 backdrop-blur-lg border-white/10"
          }`}
        >
          <nav className="flex flex-col px-8 py-4 gap-1">
            <a
              href="/#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                shouldShowScrolledStyle
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              About
            </a>
            <a
              href="/villas/palm-villa"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                shouldShowScrolledStyle
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Palm Villa
            </a>
            <a
              href="/villas/bamboo-villa"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                shouldShowScrolledStyle
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Bamboo Villa
            </a>
            <a
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 text-sm tracking-wide ${
                shouldShowScrolledStyle
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Contact
            </a>
            <Link
              href="/booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 mb-1"
            >
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-none">
                Book Now
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
