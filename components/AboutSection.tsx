export default function AboutSection() {
  // one place to tweak image heights
  const imgHeights = "h-[220px] md:h-[300px] lg:h-[360px]"; // same for ALL image blocks

  return (
    <section id="about" className="bg-white py-24 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 uppercase">
            ABOUT
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-tight max-w-4xl mx-auto">
            Villas Nestled in Nature
          </h2>
        </div>

        {/* 12-col staggered grid */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-20 lg:gap-y-24">
          {/* Col 1 */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className={`mb-8 overflow-hidden rounded-[20px] ring-1 ring-black/5 shadow-sm ${imgHeights}`}>
              <img
                src="/img9.JPG"
                alt="Luxury interior"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                loading="lazy"
              />
            </div>
            <h3 className="text-2xl text-gray-900">Personalized Design</h3>
            <p className="mt-2 max-w-[48ch] text-gray-600">
              The villas are comfort focused with warm and inviting spaces that prioritize relaxation and coziness with effortless flow between the indoors and the outdoors. 
            </p>
          </div>

          {/* Col 2 (image first on mobile, text under it; stagger on lg) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:translate-y-12 flex flex-col">
            <div className={`order-1 lg:order-2 overflow-hidden rounded-[20px] ring-1 ring-black/5 shadow-sm ${imgHeights}`}>
              <img
                src="/img8.JPG"
                alt="Modern beach house"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                loading="lazy"
              />
            </div>
            <div className="order-2 lg:order-1 mt-6 lg:mt-8">
              <h3 className="text-2xl text-gray-900">Personalized Design</h3>
              <p className="mt-2 max-w-[48ch] text-gray-600">
                The use of  beautiful wood and trees from the property adds authenticity , sustainability and a powerful story. Handcrafted pieces and natural wood accents makes the villas feel effortlessly stylish and grounded in nature. 
              </p>
            </div>
          </div>

          {/* Col 3 */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className={`mb-8 overflow-hidden rounded-[20px] ring-1 ring-black/5 shadow-sm ${imgHeights}`}>
              <img
                src="/river3.jpg"
                alt="Luxury exterior"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                loading="lazy"
              />
            </div>
            <h3 className="text-2xl text-gray-900">The Experience</h3>
            <p className="mt-2 max-w-[48ch] text-gray-600">
              The river access, views and sound create unique unforgettable moments of bliss, relaxation and fun.
            </p>
          </div>

          {/* Col 4 (image first on mobile, text under it; stagger on lg) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:translate-y-12 flex flex-col">
            <div className={`order-1 lg:order-2 overflow-hidden rounded-[20px] ring-1 ring-black/5 shadow-sm ${imgHeights}`}>
              <img
                src="/river2.jpg"
                alt="Infinity pool at sunset"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                loading="lazy"
              />
            </div>
            <div className="order-2 lg:order-1 mt-6 lg:mt-8">
              <h3 className="text-2xl text-gray-900">Location</h3>
              <p className="mt-2 max-w-[48ch] text-gray-600">
                The villas are nestled  in the hills of St Mary on the property known as the Warwick Castle Estate through which the Rio Nuevo runs. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
