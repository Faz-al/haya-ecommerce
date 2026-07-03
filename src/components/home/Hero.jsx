import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { heroSlides } from "../../data/heroSlides";

export default function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 22,
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateSelectedIndex();

    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  return (
    <section className="relative overflow-hidden bg-[#aab9c5] pt-[35px]">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {heroSlides.map((slide) => (
            <article
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%]"
            >
              <div className="relative h-[640px] sm:h-[600px] md:h-[620px] lg:h-[calc(100vh-35px)] lg:min-h-[680px] lg:max-h-[900px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  draggable="false"
                  loading={slide.id === 1 ? "eager" : "lazy"}
                  fetchPriority={slide.id === 1 ? "high" : "auto"}
                  className="absolute inset-0 h-full w-full select-none object-cover object-center"
                />

                <div className="absolute inset-0 bg-black/[0.08]" />

                <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white">
                  <div className="mt-[55px]">
                    {slide.eyebrow && (
                      <p className="mb-5 text-[10px] uppercase tracking-[0.24em]">
                        {slide.eyebrow}
                      </p>
                    )}

                    <h1 className="text-[38px] font-light uppercase leading-none tracking-[0.28em] drop-shadow-sm sm:text-[46px] md:text-[50px] lg:text-[72px]">
                      {slide.title}
                    </h1>

                    <p className="mt-6 text-[16px] font-light uppercase tracking-[0.04em] sm:text-[18px] md:text-[19px] lg:text-[24px]">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-[88px] flex justify-center sm:bottom-[92px] lg:bottom-[105px]">
                  <a
                    href={slide.href}
                    className="border-b border-white pb-1 text-[17px] font-light uppercase tracking-[0.02em] text-white transition-opacity hover:opacity-65 sm:text-[18px] lg:text-[20px]"
                  >
                    {slide.buttonText}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-3">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-[9px] w-[9px] rounded-full transition-colors duration-200 ${
              selectedIndex === index ? "bg-white" : "bg-black/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}