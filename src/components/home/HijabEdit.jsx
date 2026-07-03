import { Link } from "react-router-dom";

import heroTwo from "../../assets/images/hero-2.png";

export default function HijabEdit() {
  return (
    <section className="border-b border-black/[0.08] bg-[#ebe3da]">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
        <div className="relative h-[220px] overflow-hidden sm:h-[340px] lg:h-[620px]">
          <img
            src={heroTwo}
            alt="The Hijab Edit"
            className="h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.025]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
        </div>

        <div className="flex items-center bg-[#eee7df] px-5 py-8 sm:px-10 sm:py-12 lg:px-20 lg:py-20">
          <div className="max-w-[470px]">
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#766c64] sm:text-[9px] lg:text-[10px]">
              Curated Essentials
            </p>

            <h2 className="mt-3 font-serif text-[34px] leading-[0.96] tracking-[-0.035em] text-[#1f1a17] sm:mt-4 sm:text-[48px] lg:text-[72px]">
              The Hijab
              <br />
              Edit
            </h2>

            <p className="mt-4 max-w-[390px] text-[11px] leading-[1.7] text-[#554d46] sm:mt-5 sm:text-[13px] lg:mt-7 lg:text-[15px] lg:leading-[1.8]">
              Lightweight textures, refined drapes, and versatile shades
              designed for effortless everyday styling.
            </p>

            <Link
              to="/category/hijabs"
              className="group mt-5 inline-flex items-center gap-3 text-[8px] uppercase tracking-[0.2em] text-[#211c18] sm:mt-6 sm:text-[9px] lg:mt-8 lg:text-[10px]"
            >
              <span>Shop the Edit</span>

              <span className="relative block h-px w-9 overflow-hidden bg-black/25 sm:w-11">
                <span className="absolute inset-0 -translate-x-full bg-black transition-transform duration-500 group-hover:translate-x-0" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}