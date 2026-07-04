import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const groups = [
  {
    title: "Shop",
    links: [
      "New Arrivals",
      "Abayas",
      "Hijabs",
      "Sets",
      "Bestsellers",
    ],
  },
  {
    title: "Customer Care",
    links: [
      "Contact",
      "Delivery",
      "Returns",
      "Size Guide",
      "FAQs",
    ],
  },
  {
    title: "About",
    links: [
      "Our Story",
      "Journal",
      "Stores",
      "Careers",
      "Privacy",
    ],
  },
  {
    title: "Follow",
    links: [
      "Instagram",
      "Pinterest",
      "TikTok",
      "YouTube",
    ],
  },
];

export default function Footer() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <footer className="bg-[#1d1a18] text-[#f1ece6]">
      <div className="mx-auto max-w-[1600px] px-5 pb-8 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pb-10 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_2fr] lg:gap-24">
          <div>
            <a
              href="/"
              className="font-serif text-[48px] italic leading-none tracking-[-0.06em] sm:text-[58px]"
            >
              haya
            </a>

            <p className="mt-6 max-w-[340px] text-[12px] leading-[1.8] text-white/55 sm:text-[13px]">
              Modern modest fashion shaped by thoughtful design, fluid
              silhouettes, and understated elegance.
            </p>

            <div className="mt-8 flex items-center gap-5 text-[9px] uppercase tracking-[0.2em] text-white/65">
              <a href="#" className="transition-colors hover:text-white">
                Instagram
              </a>

              <a href="#" className="transition-colors hover:text-white">
                Pinterest
              </a>
            </div>
          </div>

          <div className="hidden grid-cols-4 gap-10 lg:grid">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[9px] uppercase tracking-[0.24em] text-white/40">
                  {group.title}
                </h3>

                <ul className="mt-6 space-y-4">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[12px] text-white/65 transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 lg:hidden">
          {groups.map((group, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={group.title}
                className="border-b border-white/10"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/70">
                    {group.title}
                  </span>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.2}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-5"
                    >
                      {group.links.map((link) => (
                        <li key={link} className="py-2">
                          <a
                            href="#"
                            className="text-[12px] text-white/55"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-[9px] uppercase tracking-[0.14em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Acid House. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>

            <a href="#" className="transition-colors hover:text-white">
              Terms
            </a>

            <a href="#" className="transition-colors hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}