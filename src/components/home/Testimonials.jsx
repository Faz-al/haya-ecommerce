import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    quote:
      "The fabric feels beautiful and the fit is incredibly considered. It looks polished without feeling overdressed.",
    name: "Ayesha K.",
    location: "London",
  },
  {
    quote:
      "The abaya drapes so well and feels effortless to wear. Every detail feels refined and thoughtfully finished.",
    name: "Mariam R.",
    location: "Dubai",
  },
  {
    quote:
      "The hijabs are soft, lightweight, and easy to style. The colours are even more elegant in person.",
    name: "Sara H.",
    location: "Manchester",
  },
];

function Review({ testimonial, bordered = false }) {
  return (
    <article
      className={`relative px-1 py-2 sm:px-4 lg:px-10 ${
        bordered ? "lg:border-l lg:border-black/[0.1]" : ""
      }`}
    >
      <blockquote className="font-serif text-[20px] leading-[1.45] tracking-[-0.015em] text-[#28221e] sm:text-[23px] lg:text-[25px]">
        “{testimonial.quote}”
      </blockquote>

      <div className="mt-6 flex items-center gap-3 text-[8px] uppercase tracking-[0.18em] sm:text-[9px]">
        <span className="text-[#211c18]">{testimonial.name}</span>
        <span className="h-px w-5 bg-black/20" />
        <span className="text-[#8a7f76]">{testimonial.location}</span>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    handleSelect();
    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleSelect);
    };
  }, [emblaApi, handleSelect]);

  return (
    <section className="border-b border-black/[0.08] bg-[#eee7df] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 px-4 text-center sm:px-7 lg:mb-10 lg:px-12">
          <p className="text-[8px] uppercase tracking-[0.3em] text-[#776d65] sm:text-[9px]">
            From Our Community
          </p>

          <h2 className="mt-3 font-serif text-[28px] leading-none tracking-[-0.03em] text-[#1f1a17] sm:text-[35px] lg:text-[42px]">
            Worn and Loved
          </h2>
        </div>

        <div className="hidden grid-cols-3 px-12 lg:grid">
          {testimonials.map((testimonial, index) => (
            <Review
              key={testimonial.name}
              testimonial={testimonial}
              bordered={index !== 0}
            />
          ))}
        </div>

        <div className="lg:hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-5 px-4 sm:px-7">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_64%]"
                >
                  <Review testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                aria-label={`View testimonial ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-[5px] rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? "w-6 bg-[#211c18]"
                    : "w-[5px] bg-[#211c18]/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}