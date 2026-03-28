"use client";

import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="px-3 sm:px-4 py-4">
      <div
        className="relative rounded-[24px] overflow-hidden shadow-xl text-white"
        style={{
          backgroundImage: `url("/2.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay (optional) */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-8 py-24 text-center">
          <h2 className="text-4xl md:text-5xl leading-[1.05]">
            Stay Connected with Pon Di Rio
          </h2>
          <p className="text-lg max-w-2xl text-gray-200 leading-relaxed">
            Luxury spaces, crafted with care. Join our community and never miss
            an update.
          </p>

          {/* Subscribe form */}
          <form className="flex h-12 items-stretch overflow-hidden rounded-full bg-white/90 shadow-md ring-1 ring-white/20">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-56 sm:w-72 bg-transparent px-4 text-sm text-black outline-none placeholder:text-black/60"
            />
            <button
              type="submit"
              className="px-6 text-sm text-black hover:text-gray-700 transition-colors"
            >
              Subscribe
            </button>
          </form>

          {/* Social links */}
          <div className="flex gap-6 mt-6">
            <a href="#" className="hover:text-gray-300">
              <Instagram />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Facebook />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Youtube />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Linkedin />
            </a>
          </div>

          {/* Copyright / Credits */}
          <div className="mt-10 text-sm text-gray-300">
            <p>© 2025 Pon Di Rio. Website by <a href="https://bixllc.net" className="underline hover:text-white">Bix LLC</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
