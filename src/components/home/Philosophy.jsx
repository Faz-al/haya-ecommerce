import philosophyImage from "../../assets/images/philosopy.png";

export default function Philosophy() {
  return (
    <section className="border-b border-black/[0.08] bg-[#e9e1d8]">
      <div className="relative h-[190px] overflow-hidden sm:h-[310px] lg:h-[620px]">
        <img
          src={philosophyImage}
          alt="Our philosophy"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-[68%_center] lg:object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#e8dfd5]/98 via-[#e8dfd5]/70 to-transparent sm:via-[#e8dfd5]/48 lg:from-[#e8dfd5]/92 lg:via-[#e8dfd5]/25" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.05] via-transparent to-white/[0.04]" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-center px-4 sm:px-7 lg:px-12">
          <div className="max-w-[190px] sm:max-w-[360px] lg:max-w-[500px]">
            <p className="text-[7px] uppercase tracking-[0.28em] text-[#645b54] sm:text-[9px] lg:text-[10px]">
              Our Philosophy
            </p>

            <h2 className="mt-3 font-serif text-[27px] font-normal leading-[0.95] tracking-[-0.035em] text-[#1f1a17] sm:mt-4 sm:text-[46px] lg:mt-6 lg:text-[72px]">
              Quiet luxury,
              <br />
              thoughtfully made.
            </h2>

            <p className="mt-6 hidden max-w-[430px] text-[14px] leading-[1.8] text-[#4e463f] lg:block">
              Modest pieces designed with considered proportions, fluid
              fabrics, and enduring details. Made to feel effortless today and
              timeless for years to come.
            </p>

            <a
              href="#"
              className="group mt-4 inline-flex items-center gap-3 text-[7px] uppercase tracking-[0.2em] text-[#211c18] sm:mt-6 sm:text-[9px] lg:mt-8 lg:text-[10px]"
            >
              <span>Discover Our Story</span>

              <span className="relative block h-px w-8 overflow-hidden bg-black/25 sm:w-10">
                <span className="absolute inset-0 -translate-x-full bg-black transition-transform duration-500 group-hover:translate-x-0" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}