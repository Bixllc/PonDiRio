"use client";

import { useState } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const faqs = [
  {
    category: "Booking & Reservations",
    questions: [
      {
        q: "How do I book a villa?",
        a: "You can book directly through our website by selecting your preferred villa, choosing your dates, and completing the secure payment process. Once payment is confirmed, you will receive a booking confirmation email with all the details for your stay.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure third-party payment provider. All transactions are processed in USD.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. Payment is handled through a PCI-compliant third-party payment provider. We never store your credit card details on our servers.",
      },
      {
        q: "Can I book for someone else?",
        a: "Yes, you can make a booking on behalf of another guest. Please ensure the guest's name and contact information are provided at the time of booking so we can prepare for their arrival.",
      },
    ],
  },
  {
    category: "Your Stay",
    questions: [
      {
        q: "What are the check-in and check-out times?",
        a: "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available upon request, subject to availability and additional fees.",
      },
      {
        q: "How do I get to Pon Di Rio?",
        a: "Our villas are located in St. Mary, Jamaica. We will provide detailed directions and transfer recommendations in your pre-arrival email. Airport transfers from Norman Manley International Airport (Kingston) or Sangster International Airport (Montego Bay) can be arranged upon request.",
      },
      {
        q: "Is there Wi-Fi available?",
        a: "Yes, complimentary high-speed Wi-Fi is available throughout the property for all guests.",
      },
      {
        q: "Are the villas suitable for children?",
        a: "Our villas are family-friendly, though parents should be mindful of the riverside setting and pool area. Children must be supervised at all times near water.",
      },
      {
        q: "Is smoking allowed?",
        a: "Smoking is not permitted inside the villas. Designated outdoor smoking areas are available on the property.",
      },
      {
        q: "Are pets allowed?",
        a: "Pets are generally not permitted. If you would like to bring a pet, please contact us in advance to discuss options and obtain approval.",
      },
    ],
  },
  {
    category: "Amenities & Services",
    questions: [
      {
        q: "What amenities are included?",
        a: "Our villas come fully equipped with modern kitchens, air conditioning, premium linens, towels, toiletries, Wi-Fi, smart TVs, and private outdoor spaces. Each villa listing on our website includes a full amenities breakdown.",
      },
      {
        q: "Can you arrange airport transfers?",
        a: "Yes, we can arrange private airport transfers for an additional fee. Please let us know your flight details at least 48 hours before your arrival so we can coordinate.",
      },
      {
        q: "Do you offer concierge services?",
        a: "We are happy to help arrange local experiences, restaurant reservations, guided tours, and other activities to enhance your stay. Simply reach out to us before or during your visit.",
      },
      {
        q: "Is there a pool?",
        a: "Yes, our property features a pool for guest use. The riverside setting also provides a unique natural swimming experience.",
      },
    ],
  },
  {
    category: "Cancellations & Refunds",
    questions: [
      {
        q: "What is your cancellation policy?",
        a: "Cancellations made 30+ days before check-in receive a full refund. Cancellations 14–29 days before check-in receive a 50% refund. Cancellations within 14 days of check-in are non-refundable. For full details, please visit our Cancellation Policy page.",
      },
      {
        q: "Can I change my booking dates?",
        a: "Date changes are subject to availability and should be requested at least 14 days before your original check-in date. Please contact us at info@pondirio.com with your booking details and preferred new dates.",
      },
      {
        q: "How long do refunds take to process?",
        a: "Refunds are typically processed within 7–10 business days and returned to the original payment method used at the time of booking.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenIndex(openIndex === id ? null : id);
  }

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
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 mb-12 max-w-2xl">
            Find answers to common questions about booking, your stay, and our
            policies. If you can&apos;t find what you&apos;re looking for,
            please don&apos;t hesitate to{" "}
            <a
              href="/contact"
              className="text-amber-700 underline hover:text-amber-600"
            >
              contact us
            </a>
            .
          </p>

          {faqs.map((section) => (
            <section key={section.category} className="mb-12">
              <h2
                className="text-2xl text-gray-900 mb-1"
                style={{
                  fontVariant: "small-caps",
                  fontFamily: "var(--font-serif), serif",
                }}
              >
                {section.category}
              </h2>
              <div className="w-12 h-0.5 bg-amber-500 mb-6" />
              <div className="space-y-3">
                {section.questions.map((item) => {
                  const id = `${section.category}-${item.q}`;
                  const isOpen = openIndex === id;
                  return (
                    <div
                      key={id}
                      className="bg-white/60 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggle(id)}
                        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/80 transition-colors"
                      >
                        <span className="font-medium text-gray-900">
                          {item.q}
                        </span>
                        <span
                          className={`text-amber-600 text-xl shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-45" : ""
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5">
                          <p className="text-gray-700 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
