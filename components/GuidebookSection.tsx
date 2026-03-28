import { MapPin, Clock, Star, Camera, Utensils, Compass } from "lucide-react";

export default function GuidebookSection() {
  const attractions = [
    {
      id: 1,
      name: "Blue Hole",
      type: "River",
      description:
        "At the Blue Hole, get the chance to cliff jump and do some rope swinging. ",
      image:
        "/bluehole.jpg",
      duration: "Half Day",
      rating: 4.9,
    },
    {
      id: 2,
      name: "Dunns River Falls",
      type: "River & Beach",
      description:
        "Explore the astounding flowing falls that extends across more than 183 metres or 960 feet. ",
      image:
        "/DunnsRiverBeach.jpg",
      duration: "Half Day",
      rating: 4.7,
    },
    {
      id: 3,
      name: "Frenchman's Cove",
      type: "Beach",
      description:
        "A 48-acre resort that combines history, natural beauty and serenity.",
      image:
        "/Frenchmans.jpg",
      duration: "Full Day",
      rating: 4.8,
    },
  ];

  const diningSpots = [
    {
      name: "Miss T's Kitchen",
      cuisine: "Local",
      description:
        "Culinary gem nestled in Ocho Rios, Jamaica.",
      priceRange: "$$",
    },
    {
      name: "Plantation Smokehouse",
      cuisine: "Local & Fusion",
      description:
        "Hidden gem known for authentic local dishes with modern presentation and exotic spice blends.",
      priceRange: "$$",
    },
    {
      name: "Evita's",
      cuisine: "Italian",
      description:
        "Fine Italian & fusion cuisine",
      priceRange: "$$",
    },
  ];

  // const insiderTips = [
  //   {
  //     icon: <Clock className="w-5 h-5" />,
  //     tip: "Best Time to Visit",
  //     advice:
  //       "Visit between April and October for perfect weather. Early mornings offer the most serene beach experiences.",
  //   },
  //   {
  //     icon: <MapPin className="w-5 h-5" />,
  //     tip: "Local Transportation",
  //     advice:
  //       "Rent a scooter for easy coastal exploration, or use the complimentary shuttle service to major attractions.",
  //   },
  //   {
  //     icon: <Camera className="w-5 h-5" />,
  //     tip: "Hidden Photo Spots",
  //     advice:
  //       "The lighthouse at dawn and the cliff-side chapel at golden hour offer Instagram-worthy shots away from crowds.",
  //   },
  //   {
  //     icon: <Compass className="w-5 h-5" />,
  //     tip: "Local Etiquette",
  //     advice:
  //       "Learn a few phrases in the local language—residents appreciate the effort and will share their favorite spots.",
  //   },
  // ];

  return (
    <section id="guide" className="py-24 px-4 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-6">
            DESTINATION GUIDE
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-gray-900 mb-6">
            Discover Paradise
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your comprehensive guide to the most enchanting experiences, hidden
            gems, and local treasures that make this destination truly
            extraordinary.
          </p>
        </div>

        <div className="space-y-20">
          {/* About the Destination */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-gray-900" />
                <h3 className="text-3xl text-gray-900">About Pon Di Rio</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Nestled between pristine coastlines and lush mountainous
                terrain, our destination offers an unparalleled blend of natural
                beauty, rich cultural heritage, and modern luxury. This tropical
                paradise has been carefully preserved to maintain its authentic
                charm while providing world-class amenities.
              </p>
              <p className="text-gray-600 leading-relaxed">
                With year-round perfect weather, crystal-clear waters, and a
                vibrant local culture, it's no wonder this hidden gem has
                become the ultimate retreat for discerning travelers seeking
                both adventure and tranquility.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5">
              <div className="aspect-[4/3]">
                <img
                  src="/img3.png"
                  alt="Mountain range above a sea of clouds at sunrise"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Must-Visit Attractions */}
          <div>
            <div className="flex items-center gap-3 mb-10 md:mb-12">
              <Star className="w-6 h-6 text-gray-900" />
              <h3 className="text-3xl text-gray-900">Our Guide Book</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attractions.map((a) => (
                <article key={a.id} className="group">
                  <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 mb-6">
                    <div className="aspect-[4/3]">
                      <img
                        src={a.image}
                        alt={a.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* badge */}
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1">
                        {a.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-current" />
                        {a.rating}
                      </span>
                    </div>

                    <h4 className="text-xl text-gray-900">{a.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-[40ch]">
                      {a.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-gray-200">
                      <Clock className="w-4 h-4" />
                      <span>{a.duration}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Culinary Experiences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Utensils className="w-6 h-6 text-gray-900" />
                <h3 className="text-3xl text-gray-900">Culinary Experiences</h3>
              </div>

              <div className="space-y-6">
                {diningSpots.map((spot) => (
                  <div
                    key={spot.name}
                    className="p-6 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg text-gray-900">{spot.name}</h4>
                      <span className="text-sm text-gray-500">
                        {spot.priceRange}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{spot.cuisine}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5">
              <div className="aspect-[4/5]">
                <img
                  src="/missts.jpg"
                  alt="Plated fine dining dish in a candlelit restaurant"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Local Insider Tips
          <div>
            <div className="flex items-center gap-3 mb-10 md:mb-12">
              <Compass className="w-6 h-6 text-gray-900" />
              <h3 className="text-3xl text-gray-900">Local Insider Tips</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {insiderTips.map((tip) => (
                <div
                  key={tip.tip}
                  className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm ring-1 ring-black/5"
                >
                  <div className="p-3 rounded-xl bg-gray-100">{tip.icon}</div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg text-gray-900">{tip.tip}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tip.advice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
