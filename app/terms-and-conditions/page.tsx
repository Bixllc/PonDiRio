import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Terms & Conditions | Pon Di Rio",
  description:
    "Terms and conditions for booking at Pon Di Rio luxury villa rentals in Jamaica.",
};

export default function TermsAndConditionsPage() {
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
            Terms &amp; Conditions
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
              Agreement to Terms
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              By accessing our website or making a reservation with Pon Di Rio,
              you agree to be bound by these Terms &amp; Conditions. If you do
              not agree with any part of these terms, please do not use our
              services. These terms apply to all guests, visitors, and users of
              our website.
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
              Reservations &amp; Payment
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-2">
              <li>
                All reservations are subject to availability and are only
                confirmed once full payment has been successfully processed.
              </li>
              <li>
                Payment is handled through our secure third-party payment
                provider. Pon Di Rio does not store or have access to your credit
                card details.
              </li>
              <li>
                Prices are quoted in USD and include all applicable taxes unless
                otherwise stated.
              </li>
              <li>
                A booking confirmation email will be sent upon successful payment
                with your reservation details.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Check-In &amp; Check-Out
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-2">
              <li>
                Check-in time is <strong>3:00 PM</strong> and check-out time is{" "}
                <strong>11:00 AM</strong> unless otherwise arranged.
              </li>
              <li>
                Early check-in or late check-out may be available upon request
                and is subject to availability and additional fees.
              </li>
              <li>
                Guests must present valid government-issued photo identification
                upon check-in.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Property Rules
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-2">
              <li>
                Maximum occupancy must not exceed the number specified in your
                booking. Additional guests are not permitted without prior
                approval.
              </li>
              <li>Smoking is not permitted inside the villas.</li>
              <li>
                Pets are not allowed on the property unless specifically approved
                in advance.
              </li>
              <li>
                Guests are expected to treat the property with care and respect.
                Any damage beyond normal wear and tear will be charged to the
                guest.
              </li>
              <li>
                Quiet hours are observed between <strong>10:00 PM</strong> and{" "}
                <strong>7:00 AM</strong> out of consideration for neighbouring
                properties.
              </li>
              <li>
                Events, parties, or gatherings beyond the booked guest count are
                strictly prohibited without prior written approval and may incur
                additional fees.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Liability &amp; Disclaimer
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed mb-4">
              Pon Di Rio shall not be held liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-2">
              <li>
                Loss, theft, or damage to personal belongings during your stay
              </li>
              <li>
                Injuries sustained on the property — guests use all facilities
                at their own risk
              </li>
              <li>
                Service interruptions due to events beyond our control,
                including but not limited to natural disasters, power outages, or
                public emergencies
              </li>
              <li>
                Inaccuracies in third-party content, including linked websites
                and external services
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2
              className="text-2xl text-gray-900 mb-1"
              style={{
                fontVariant: "small-caps",
                fontFamily: "var(--font-serif), serif",
              }}
            >
              Intellectual Property
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              All content on this website — including text, images,
              photographs, logos, and design elements — is the property of Pon
              Di Rio or its licensors and is protected by copyright and
              intellectual property laws. You may not reproduce, distribute, or
              use any content without our prior written consent.
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
              Governing Law
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              These Terms &amp; Conditions are governed by and construed in
              accordance with the laws of Jamaica. Any disputes arising from
              these terms or your use of our services shall be subject to the
              exclusive jurisdiction of the courts of Jamaica.
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
              Changes to These Terms
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mb-4" />
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to update these Terms &amp; Conditions at any
              time. Changes will be posted on this page with an updated revision
              date. Continued use of our website or services after changes are
              posted constitutes your acceptance of the revised terms.
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
              If you have any questions about these terms, please contact us at{" "}
              <a
                href="mailto:info@pondirio.com"
                className="text-amber-700 underline hover:text-amber-600"
              >
                info@pondirio.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
