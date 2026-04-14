import Image from "next/image";
import Link from "next/link";

const rows = [
  {
    num: "01",
    img: "/about-design.jpeg",
    alt: "Luxury villa bedroom with wooden beams and natural furnishings",
    heading: "Personalized Design",
    body: "The use of beautiful wood and trees from the property adds authenticity, sustainability and a powerful story. Handcrafted pieces and natural wood accents makes the villas feel effortlessly stylish and grounded in nature.",
  },
  {
    num: "02",
    img: "/about-experience.jpg",
    alt: "Guests enjoying riverside dining together",
    heading: "The Experience",
    body: "The river access, views and sound create unique unforgettable moments of bliss, relaxation and fun.",
  },
  {
    num: "03",
    img: "/about-location.jpg",
    alt: "Guest relaxing in the river with a glass of wine",
    heading: "Location",
    body: "The villas are nestled in the hills of St Mary on the property known as the Warwick Castle Estate through which the Rio Nuevo runs.",
  },
];

export default function AboutSection() {
  return (
    <>
    <section id="about" className="bg-[#F5F1E8] pt-24 pb-32 px-6 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <h2
          className="text-5xl md:text-7xl lg:text-8xl text-gray-900 leading-[1.05] tracking-tight mb-16"
          style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
        >
          Pon Di Rio,
          <br />
          St. Mary, Jamaica
        </h2>

        {/* 2-column intro text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8 mb-24">
          <div className="text-gray-600 text-base leading-relaxed space-y-6">
            <p>
              Pon Di Rio Villas offers a serene blend of luxury and nature.
              Each villa features bright bathrooms with plush beds, vaulted
              ceilings and hardwood finishes.
            </p>
            <p>
              Guests can enjoy private open-air rainfall showers with
              river-inspired finishes, then unwind on the spacious riverside deck
              shaded by trees and surrounded by lush greenery.
            </p>
          </div>
          <p className="text-gray-600 text-base leading-relaxed md:mt-0">
            Just steps away, the crystal-clear river&mdash; complete with
            shallow and deeper areas for wading or swimming&mdash; creates a
            secluded natural sanctuary perfect for relaxation, meditation,
            photography, or simply embracing the peaceful beauty of
            Jamaica&apos;s outdoors.
          </p>
        </div>

        {/* Numbered rows */}
        <div className="flex flex-col">
          {rows.map((row) => (
            <div key={row.num} className="border-t border-gray-300 py-14 md:py-20">
              <div className="grid grid-cols-1 md:grid-cols-[60px_280px_1fr] gap-6 md:gap-10 items-start">
                {/* Number */}
                <span className="text-sm text-gray-400 pt-2">{row.num}.</span>

                {/* Image — square */}
                <div className="relative w-full h-[220px] md:h-[240px] overflow-hidden rounded-sm">
                  <Image
                    src={row.img}
                    alt={row.alt}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4"
                    style={{ fontVariant: "small-caps", fontFamily: "var(--font-serif), serif" }}
                  >
                    {row.heading}
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed max-w-xl">
                    {row.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Transition river image — overlaps both sections */}
    <div className="relative pb-[60px] md:pb-[80px]" style={{ backgroundColor: "#c8d5c3" }}>
      {/* Beige overlay covers just the top portion behind the image */}
      <div className="absolute inset-x-0 top-0 h-[75%] bg-[#F5F1E8]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-16 -mt-2">
        <div className="relative w-full h-[50vh] md:h-[65vh] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <Image
            src="/img13.JPG"
            alt="Outdoor deck and gazebo at Pon Di Rio"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </div>
    </>
  );
}
