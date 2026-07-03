import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import heroImage from "../../assets/images/hero.jpg";

function getLinkLabel(link) {
  return typeof link === "string" ? link : link.label;
}

function getLinkHref(link) {
  return typeof link === "string" ? "/shop" : link.href;
}

export default function MegaMenu({ item, onClose }) {
  if (!item?.columns) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="absolute left-0 right-0 top-full border-t border-black/10 bg-[#f4f0eb] text-[#1e1a17] shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      onMouseLeave={onClose}
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_1fr_1.2fr] gap-16 px-12 py-12">
        {item.columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-6 text-[10px] uppercase tracking-[0.25em] text-black/55">
              {column.title}
            </h3>

            <ul className="space-y-4">
              {column.links.map((link) => (
                <li key={getLinkLabel(link)}>
                  <Link
                    to={getLinkHref(link)}
                    onClick={onClose}
                    className="text-[14px] transition-opacity hover:opacity-50"
                  >
                    {getLinkLabel(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <Link
          to={item.href || "/shop"}
          onClick={onClose}
          className="group relative min-h-[220px] overflow-hidden bg-[#c9beb3]"
        >
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute bottom-7 left-7 text-white">
            <p className="text-[10px] uppercase tracking-[0.22em]">
              Featured Collection
            </p>

            <h3 className="mt-2 font-serif text-[30px]">
              {item.label}
            </h3>

            <span className="mt-4 inline-block border-b border-white pb-1 text-[10px] uppercase tracking-[0.18em]">
              Shop Now
            </span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}