import { Link } from "react-router-dom";

import heroImage from "../../assets/images/hero.jpg";
import heroOne from "../../assets/images/hero-1.png";
import heroTwo from "../../assets/images/hero-2.png";

const collections = [
  {
    title: "Hijabs",
    subtitle: "Soft everyday layers",
    image: heroTwo,
    href: "/category/hijabs",
  },
  {
    title: "Abayas",
    subtitle: "Fluid silhouettes",
    image: heroOne,
    href: "/category/abayas",
  },
  {
    title: "Essentials",
    subtitle: "Styling must-haves",
    image: heroImage,
    href: "/category/essentials-accessories",
  },
  {
    title: "New In",
    subtitle: "The latest edit",
    image: heroOne,
    href: "/shop?sort=new-arrivals",
  },
  {
    title: "Bestsellers",
    subtitle: "Most loved pieces",
    image: heroTwo,
    href: "/shop?sort=bestsellers",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="border-b border-black/[0.08] bg-[#f5f1ec] py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex items-end justify-between px-4 sm:mb-9 sm:px-7 lg:mb-11 lg:px-12">
          <div>
            <p className="mb-2 text-[8px] uppercase tracking-[0.28em] text-[#756c65] sm:text-[9px]">
              Explore
            </p>

            <h2 className="font-serif text-[28px] leading-none tracking-[-0.025em] text-[#1d1916] sm:text-[34px] lg:text-[44px]">
              Collections
            </h2>
          </div>

          <Link
            to="/shop"
            className="group flex items-center gap-2 pb-1 text-[8px] uppercase tracking-[0.2em] text-[#28221e] sm:text-[9px] lg:text-[10px]"
          >
            <span>View All</span>

            <span className="relative block h-px w-8 overflow-hidden bg-black/25">
              <span className="absolute inset-0 -translate-x-full bg-black transition-transform duration-500 group-hover:translate-x-0" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-7 lg:grid-cols-5 lg:gap-5 lg:px-12">
          {collections.map((item, index) => (
            <Link
              key={item.title}
              to={item.href}
              className={`group relative overflow-hidden bg-[#d8cec4] ${
                index === 4 ? "hidden lg:block" : ""
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-[150px] w-full object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] sm:h-[220px] lg:h-[300px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 px-4 pb-4 text-white sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
                <p className="mb-2 text-[7px] uppercase tracking-[0.2em] text-white/75 sm:text-[8px]">
                  {item.subtitle}
                </p>

                <h3 className="font-serif text-[22px] leading-none tracking-[-0.02em] sm:text-[27px] lg:text-[34px]">
                  {item.title}
                </h3>

                <span className="mt-3 inline-flex items-center gap-2 text-[7px] uppercase tracking-[0.18em] sm:text-[8px] lg:text-[9px]">
                  <span>Shop Now</span>

                  <span className="relative block h-px w-7 overflow-hidden bg-white/40">
                    <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}