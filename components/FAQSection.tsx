import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Can you accommodate special requests?",
    a: "Yes. From chef services and dietary needs to celebrations and excursions, we’ll coordinate every detail to your specifications.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Policies vary by property and season. We’ll outline the exact terms before you confirm; flexible options are available on request.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-white py-24 px-4 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-gray-500">FAQ</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors open:bg-gray-50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <h3 className="text-base md:text-lg font-medium text-gray-900">
                  {item.q}
                </h3>
                <span className="shrink-0 rounded-full border border-gray-200 p-1 transition-transform group-open:rotate-180">
                  <ChevronDown className="h-5 w-5 text-gray-700" />
                </span>
              </summary>

              <div className="mt-3 text-sm md:text-base leading-relaxed text-gray-600">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
