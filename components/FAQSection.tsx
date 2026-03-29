import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Can you accommodate special requests?",
    a: "Yes. From chef services and dietary needs to celebrations and excursions, we'll coordinate every detail to your specifications.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Policies vary by property and season. We'll outline the exact terms before you confirm; flexible options are available on request.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-[#F5F1E8] py-24 px-6 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h2
          className="text-5xl md:text-7xl lg:text-8xl text-gray-900 leading-[1.05] tracking-tight mb-16"
          style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
        >
          Frequently Asked
          <br />
          Questions
        </h2>

        <div>
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group border-b border-gray-300 py-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <h3
                  className="text-xl md:text-2xl text-gray-900"
                  style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                >
                  {item.q}
                </h3>
                <span className="shrink-0 transition-transform group-open:rotate-180">
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </span>
              </summary>

              <div className="mt-4 text-base leading-relaxed text-gray-600 max-w-3xl">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
