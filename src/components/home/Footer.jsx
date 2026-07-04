import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const groups = [
  {
    title: "Shop",
    links: [
      {
        label: "Shop All",
        to: "/shop",
      },
      {
        label: "New Arrivals",
        to: "/shop?sort=new-arrivals",
      },
      {
        label: "Bestsellers",
        to: "/shop?sort=bestsellers",
      },
      {
        label: "Featured",
        to: "/shop?sort=featured",
      },
      {
        label: "Newest",
        to: "/shop?sort=newest",
      },
    ],
  },
  {
    title: "Categories",
    links: [
      {
        label: "Abayas",
        to: "/category/abayas",
      },
      {
        label: "Hijabs",
        to: "/category/hijabs",
      },
      {
        label: "Clothing",
        to: "/category/clothing",
      },
      {
        label: "Essentials",
        to: "/category/essentials",
      },
      {
        label: "Collections",
        to: "/category/collections",
      },
      {
        label: "Sale",
        to: "/shop?sort=price-low",
      },
    ],
  },
  {
    title: "Customer Care",
    links: [
      {
        label: "Contact",
        to: "/contact",
      },
      {
        label: "Delivery",
        to: "/delivery",
      },
      {
        label: "Returns",
        to: "/returns",
      },
      {
        label: "Size Guide",
        to: "/size-guide",
      },
      {
        label: "FAQs",
        to: "/faqs",
      },
    ],
  },
  {
    title: "About",
    links: [
      {
        label: "Our Story",
        to: "/about",
      },
      {
        label: "Journal",
        to: "/journal",
      },
      {
        label: "Privacy",
        to: "/privacy",
      },
      {
        label: "Terms",
        to: "/terms",
      },
      {
        label: "Cookies",
        to: "/cookies",
      },
    ],
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
  },
];

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function FooterLink({ link, className = "", onClick }) {
  if (link.href) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={onClick}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      to={link.to}
      className={className}
      onClick={() => {
        scrollToTop();

        if (onClick) {
          onClick();
        }
      }}
    >
      {link.label}
    </Link>
  );
}

export default function Footer() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <footer className="bg-[#1d1a18] text-[#f1ece6]">
      <div className="mx-auto max-w-[1600px] px-5 pb-8 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pb-10 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_2fr] lg:gap-24">
          <div>
            <Link
              to="/"
              onClick={scrollToTop}
              className="font-serif text-[48px] italic leading-none tracking-[-0.06em] sm:text-[58px]"
            >
              haya
            </Link>

            <p className="mt-6 max-w-[340px] text-[12px] leading-[1.8] text-white/55 sm:text-[13px]">
              Modern modest fashion shaped by thoughtful design, fluid
              silhouettes, and understated elegance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[9px] uppercase tracking-[0.2em] text-white/65">
              {socialLinks.slice(0, 2).map((link) => (
                <FooterLink
                  key={link.label}
                  link={link}
                  className="transition-colors hover:text-white"
                />
              ))}
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
                    <li key={link.label}>
                      <FooterLink
                        link={link}
                        className="text-[12px] text-white/65 transition-colors hover:text-white"
                      />
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
                  onClick={() => setOpenIndex(isOpen ? null : index)}
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
                        <li key={link.label} className="py-2">
                          <FooterLink
                            link={link}
                            className="text-[12px] text-white/55 transition-colors hover:text-white"
                            onClick={() => setOpenIndex(null)}
                          />
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 pt-7 text-[9px] uppercase tracking-[0.2em] text-white/45 lg:hidden">
          {socialLinks.map((link) => (
            <FooterLink
              key={link.label}
              link={link}
              className="transition-colors hover:text-white"
            />
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-[9px] uppercase tracking-[0.14em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Haya. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link
              to="/privacy"
              onClick={scrollToTop}
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              onClick={scrollToTop}
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>

            <Link
              to="/cookies"
              onClick={scrollToTop}
              className="transition-colors hover:text-white"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}