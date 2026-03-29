"use client";

import Image from "next/image";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/footer-bg.jpg"
          alt=""
          fill
          className="object-cover"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1923]/95 via-[#0f1923]/85 to-[#0f1923]/70" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {/* Brand column */}
          <div>
            <Image
              src="/logotransparent.png"
              alt="Pon Di Rio"
              width={80}
              height={80}
              className="mb-6"
            />
            <p className="text-gray-300 text-sm leading-relaxed max-w-[260px]">
              Luxury riverside villas nestled in the heart of St. Mary, Jamaica.
            </p>
            <div className="flex gap-4 mt-8">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border-2 border-amber-500 bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 hover:border-amber-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:info@pondirio.com"
                className="w-11 h-11 rounded-full border-2 border-amber-500 bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 hover:border-amber-400 transition-colors"
              >
                <Mail size={20} />
              </a>
              <a
                href="tel:+1234567890"
                className="w-11 h-11 rounded-full border-2 border-amber-500 bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 hover:border-amber-400 transition-colors"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#villas" className="hover:text-white transition-colors">
                  Our Villas
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Policies</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sign Up for Updates</h3>
            <p className="text-gray-300 text-sm mb-6">
              Stay informed about exclusive offers and news.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Your email"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-gray-500 text-white text-sm placeholder:text-gray-400 outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 mt-14 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span>&copy; 2026 Pon Di Rio. All rights reserved.</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>
                Designed &amp; Developed by{" "}
                <a
                  href="https://bixllc.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Bix
                </a>
              </span>
            </div>
            <span>St Mary, Jamaica</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
