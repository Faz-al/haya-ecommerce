import { Gem, Clock, Package, Lock } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Premium",
    subtitle: "Fabrics",
    description: "Quality you can feel",
  },
  {
    icon: Clock,
    title: "Timeless",
    subtitle: "Designs",
    description: "Made to last beyond trends",
  },
  {
    icon: Package,
    title: "Worldwide",
    subtitle: "Shipping",
    description: "Delivered with care",
  },
  {
    icon: Lock,
    title: "Secure",
    subtitle: "Payments",
    description: "Shop with confidence",
  },
];

export default function Newsletter() {
  return (
    <section className="border-y border-[#ded5cc] bg-[#ece4da]">
      <div className="mx-auto grid max-w-[1600px] grid-cols-4">
        {features.map(
          ({ icon: Icon, title, subtitle, description }, index) => (
            <div
              key={title}
              className="relative flex min-w-0 flex-col items-center justify-center px-1 py-4 text-center sm:px-3 lg:flex-row lg:justify-center lg:gap-4 lg:px-8 lg:py-6 lg:text-left"
            >
              {index !== 0 && (
                <span className="absolute left-0 top-1/2 h-[48%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-[#cfc5bb]/70 to-transparent" />
              )}

              <Icon
                size={19}
                strokeWidth={1.1}
                className="mb-2 shrink-0 text-[#24201d] lg:mb-0 lg:h-[27px] lg:w-[27px]"
              />

              <div className="min-w-0">
                <h3 className="text-[7px] uppercase leading-[1.3] tracking-[0.07em] text-[#211d1a] sm:text-[8px] lg:text-[10px] lg:tracking-[0.15em]">
                  <span className="block lg:inline">{title}</span>
                  <span className="block lg:ml-1 lg:inline">{subtitle}</span>
                </h3>

                <p className="mt-1 hidden whitespace-nowrap text-[10px] text-[#766b62] lg:block">
                  {description}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}