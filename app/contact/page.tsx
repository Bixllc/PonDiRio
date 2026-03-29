import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="bg-[#f5f0eb] pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h1
            className="text-6xl md:text-7xl lg:text-8xl text-[#1a2332]"
            style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
          >
            Contact Us
          </h1>
          <p className="mt-6 text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We&apos;d love to hear from you. Whether you have questions about bookings, special requests, or simply want to learn more about our riverside villas, our team is here to help.
          </p>
        </div>
      </section>

      {/* Get in Touch + Form Section */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left - Contact Info */}
            <div>
              <h2
                className="text-5xl md:text-6xl text-[#1a2332] mb-8"
                style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
              >
                Get in Touch
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-12">
                Our team is ready to assist you with any inquiries about your stay at Pon Di Rio.
              </p>

              <div className="space-y-10">
                <div>
                  <h3
                    className="text-xl text-[#1a2332] mb-2"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Email
                  </h3>
                  <p className="text-gray-700 text-base">info@pondirio.com</p>
                </div>

                <div>
                  <h3
                    className="text-xl text-[#1a2332] mb-2"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Phone
                  </h3>
                  <p className="text-gray-700 text-base">+1 (876) 555-0123</p>
                </div>

                <div>
                  <h3
                    className="text-xl text-[#1a2332] mb-2"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Location
                  </h3>
                  <p className="text-gray-700 text-base">
                    St Mary, Jamaica
                  </p>
                </div>

                <div>
                  <h3
                    className="text-xl text-[#1a2332] mb-2"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    Hours
                  </h3>
                  <p className="text-gray-700 text-base">
                    Monday &ndash; Sunday: 9:00 AM &ndash; 6:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1a2332] text-base outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1a2332] text-base outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1a2332] text-base outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a2332] mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1a2332] text-base outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-lg bg-amber-600 text-white text-base font-medium shadow-lg hover:bg-amber-700 transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
