"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subError, setSubError] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail) return;

    setSubStatus("loading");
    setSubError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const json = await res.json();

      if (!json.success) {
        setSubStatus("error");
        setSubError(json.error || "Failed to subscribe");
        return;
      }

      setSubStatus("success");
      setSubEmail("");
    } catch {
      setSubStatus("error");
      setSubError("Something went wrong. Please try again.");
    }
  }
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
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sign Up for Updates</h3>
            <p className="text-gray-300 text-sm mb-6">
              Stay informed about exclusive offers and news.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Your email"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                disabled={subStatus === "loading" || subStatus === "success"}
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-gray-500 text-white text-sm placeholder:text-gray-400 outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={subStatus === "loading" || subStatus === "success"}
                className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {subStatus === "loading" ? "Subscribing..." : subStatus === "success" ? "Subscribed!" : "Subscribe"}
              </button>
              {subStatus === "success" && (
                <p className="text-sm text-green-400">Thanks for subscribing!</p>
              )}
              {subStatus === "error" && (
                <p className="text-sm text-red-400">{subError}</p>
              )}
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

          {/* Payment logos */}
          <div className="flex items-center justify-center gap-6 mt-6 opacity-60">
            {/* Visa */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 500" className="h-6 w-auto" aria-label="Visa">
              <rect width="780" height="500" rx="40" fill="#1A1F71" />
              <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8zM540.7 157.3c-10.5-4-27.1-8.3-47.7-8.3-52.6 0-89.7 26.5-89.9 64.5-.3 28.1 26.4 43.7 46.6 53.1 20.7 9.6 27.7 15.7 27.6 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.3 0-32.6-3-50.2-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.5 10.2 59.4 10.5 56 0 92.3-26.2 92.7-66.8.2-22.3-14-39.2-44.6-53.2-18.6-9.1-30-15.1-29.9-24.3 0-8.1 9.6-16.8 30.4-16.8 17.4-.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.3zM636.5 152.9h-41.2c-12.8 0-22.3 3.5-27.9 16.2l-79.2 179.6h56l11.2-29.4h68.4l6.5 29.4h49.4l-43.2-195.8zm-65.8 126.4c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.6h-44.5zM232.1 152.9l-52.2 133.5-5.6-27.1c-9.7-31.2-39.9-65.1-73.7-82l47.8 171.2h56.4l83.8-195.6h-56.5z" fill="#fff" />
              <path d="M124.6 152.9H38.2l-.6 3.6c66.9 16.2 111.2 55.4 129.6 102.4l-18.7-90.1c-3.2-12.4-12.7-15.5-24.9-15.9z" fill="#F9A533" />
            </svg>
            {/* Mastercard */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 500" className="h-6 w-auto" aria-label="Mastercard">
              <rect width="780" height="500" rx="40" fill="#252525" />
              <circle cx="330" cy="250" r="140" fill="#EB001B" />
              <circle cx="450" cy="250" r="140" fill="#F79E1B" />
              <path d="M390 143.6c34.5 27.8 56.6 70.1 56.6 117.4s-22.1 89.6-56.6 117.4c-34.5-27.8-56.6-70.1-56.6-117.4s22.1-89.6 56.6-117.4z" fill="#FF5F00" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
