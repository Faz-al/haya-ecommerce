import heroOne from "../../assets/images/hero-1.png";

export default function NewsletterSignup() {
  return (
    <section className="border-b border-black/[0.08] bg-[#f3eee8]">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[520px] overflow-hidden lg:block">
          <img
            src={heroOne}
            alt="Modest fashion editorial"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="flex items-center px-5 py-14 sm:px-10 sm:py-20 lg:min-h-[520px] lg:px-20">
          <div className="w-full max-w-[560px]">
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#766c64] sm:text-[9px] lg:text-[10px]">
              Stay Connected
            </p>

            <h2 className="mt-4 font-serif text-[38px] leading-[0.98] tracking-[-0.035em] text-[#1f1a17] sm:text-[52px] lg:text-[68px]">
              Join Our
              <br />
              Private List
            </h2>

            <p className="mt-5 max-w-[460px] text-[12px] leading-[1.8] text-[#554d46] sm:text-[14px] lg:mt-7 lg:text-[15px]">
              Be the first to discover new collections, private offers, and
              thoughtful edits from our world.
            </p>

            <form
              className="mt-7 flex border-b border-black/30 lg:mt-9"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent py-4 text-[12px] text-[#211c18] outline-none placeholder:text-[#8f847b] sm:text-[13px]"
              />

              <button
                type="submit"
                className="group flex items-center gap-3 px-2 text-[8px] uppercase tracking-[0.2em] text-[#211c18] sm:text-[9px] lg:text-[10px]"
              >
                <span>Subscribe</span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>

            <p className="mt-4 text-[9px] leading-[1.6] text-[#887d74]">
              By subscribing, you agree to receive updates from us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}