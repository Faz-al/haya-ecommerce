import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Premium Fabrics",
    text: "Chosen for comfort and drape",
  },
  {
    icon: Truck,
    title: "Worldwide Delivery",
    text: "Carefully packed and shipped",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    text: "Simple and considered returns",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    text: "Protected payment experience",
  },
];

export default function BenefitsStrip() {
  return (
    <section className="border-b border-black/[0.08] bg-[#ebe4dc]">
      <div className="mx-auto grid max-w-[1600px] grid-cols-4">
        {benefits.map(({ icon: Icon, title, text }, index) => (
          <div
            key={title}
            className="relative flex min-w-0 flex-col items-center justify-center px-1 py-5 text-center sm:px-4 sm:py-7 lg:flex-row lg:justify-center lg:gap-4 lg:px-8 lg:py-8 lg:text-left"
          >
            {index !== 0 && (
              <span className="absolute left-0 top-1/2 h-[46%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-black/15 to-transparent" />
            )}

            <Icon
              size={19}
              strokeWidth={1.15}
              className="mb-2 shrink-0 text-[#211c18] sm:h-[22px] sm:w-[22px] lg:mb-0 lg:h-[26px] lg:w-[26px]"
            />

            <div className="min-w-0">
              <h3 className="text-[6px] uppercase leading-[1.35] tracking-[0.09em] text-[#211c18] sm:text-[8px] lg:text-[10px] lg:tracking-[0.17em]">
                {title}
              </h3>

              <p className="mt-1 hidden text-[10px] leading-[1.5] text-[#756b63] lg:block">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}