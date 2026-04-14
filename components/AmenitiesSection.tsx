import Image from "next/image";
import { Wifi, Car, Kayak, BrushCleaning, ChefHat } from "lucide-react";

export default function AmenitiesSection() {
  const amenities = [
    {
      id: 1,
      icon: <Wifi className="w-7 h-7" />,
      title: "High-Speed Internet",
      description: "Fiber-optic connectivity throughout the property",
    },
    {
      id: 2,
      icon: <Car className="w-7 h-7" />,
      title: "Parking",
      description: "Parking available.",
    },
    {
      id: 4,
      icon: <BrushCleaning className="w-7 h-7" />,
      title: "Cleaning",
      description: "Light house keeping daily between 9am-11am",
    },
    {
      id: 5,
      icon: <Kayak className="w-7 h-7" />,
      title: "Access to River",
      description: "Access to your own private river at any time",
    },
    {
      id: 6,
      icon: <ChefHat className="w-7 h-7" />,
      title: "Chef",
      description: "Chef available upon request",
    },
  ];

  return (
    <section id="amenities" className="py-24 px-4 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 uppercase">
            LUXURY AMENITIES
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-tight max-w-4xl mx-auto">
            Premium Living Experience
          </h2>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-md order-2 lg:order-1">
            <Image
              src="/img13.JPG"
              alt="Modern luxury property interior"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right grid */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {amenities.map((item) => (
                <div key={item.id} className="flex items-start gap-4 group">
                  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
