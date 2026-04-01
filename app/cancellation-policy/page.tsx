import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Cancellation Policy | Pon Di Rio",
  description:
    "Cancellation and refund policy for Pon Di Rio luxury villa rentals in Jamaica.",
};

export default function CancellationPolicyPage() {
  return (
    <>
      <NavBar />
      <main className="bg-[#F5F1E8] min-h-screen pt-32 pb-24 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-5xl text-gray-900 mb-4"
            style={{
              fontVariant: "small-caps",
              fontFamily: "var(--font-serif), serif",
            }}
          >
            Cancellation Policy
          </h1>
          <p className="text-sm text-gray-500 mb-12">
            Last updated: March 30, 2026
          </p>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Overview
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              We understand that plans can change. Our cancellation policy is
              designed to be fair to both our guests and our business. Please
              review the terms below carefully before making your reservation.
              All cancellation requests must be submitted in writing via email to{" "}
              <a
                href="mailto:pondiriocottages@gmail.com"
                className="text-amber-700 underline hover:text-amber-600"
              >
                pondiriocottages@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Cancellation Tiers
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <div className="space-y-6">
              <div className="bg-white/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  30+ days before check-in
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Full refund of the total booking amount. Refunds are processed
                  within 7–10 business days to the original payment method.
                </p>
              </div>
              <div className="bg-white/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  14–29 days before check-in
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  50% refund of the total booking amount. The remaining 50% is
                  retained to cover reservation costs and lost availability.
                </p>
              </div>
              <div className="bg-white/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Less than 14 days before check-in
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  No refund. Due to the short notice, we are unable to offer a
                  refund for cancellations made within 14 days of your scheduled
                  check-in date.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              No-Shows
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              Guests who do not arrive on their scheduled check-in date without
              prior notice will be considered a no-show. No refund will be
              issued, and the reservation will be cancelled after 24 hours.
            </p>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Modifications
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              Date changes are accommodated when possible and are subject to
              availability. Requests to modify your reservation should be made at
              least 14 days before your original check-in date. If the new dates
              result in a higher rate, the difference will be charged. If the new
              dates result in a lower rate, the difference will be refunded.
            </p>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Force Majeure
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              In the event of extraordinary circumstances beyond our control —
              including natural disasters, hurricanes, government-imposed travel
              restrictions, or public health emergencies — we will work with
              affected guests to reschedule their stay or provide a full refund
              at our discretion. Pon Di Rio is not liable for additional costs
              such as flights, transportation, or other travel expenses.
            </p>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Early Departure
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              No refund will be issued for early departures or unused nights. We
              encourage guests to contact us if any issues arise during their
              stay so we can address them promptly.
            </p>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Contact Us
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              For cancellation or modification requests, please email us at{" "}
              <a
                href="mailto:pondiriocottages@gmail.com"
                className="text-amber-700 underline hover:text-amber-600"
              >
                pondiriocottages@gmail.com
              </a>{" "}
              with your booking confirmation number and the reason for your
              request.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
