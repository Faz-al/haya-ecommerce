import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

const filterGroups = [
  {
    title: "Category",
    key: "category",
    options: [
      "Hijabs",
      "Malaysian Heavy Chiffon Hijab",
      "Premium Jersey Hijab",
      "Organza Hijab",
      "Organza Shimmer Hijab",
      "Chiffon Shimmer Hijab",
      "Animal Print Hijab",
      "Satin Hijab",
      "Jersey Stone Hijab",
      "Satin Stone Hijab",
      "Chiffon Stone Hijab",
      "Cotton Hijab",

      "Essentials & Accessories",
      "Hijab Caps",
      "Neck Extension",
      "Sleeve Extension",
      "Socks",
      "Hijab Sharpener",
      "Hijab Magnet",
      "Hijab Loops",

      "Clothing",
      "Dresses",
      "Abayas",
      "Co-ords",
      "Tops",
      "Bottoms",
      "Outerwear",
    ],
  },
  {
    title: "Collection",
    key: "collection",
    options: [
      "New Arrivals",
      "Bestsellers",
      "Featured",
    ],
  },
  {
    title: "Size",
    key: "size",
    options: ["XS", "S", "M", "L", "XL", "One Size"],
  },
  {
    title: "Availability",
    key: "availability",
    options: ["In Stock"],
  },
];

export default function FilterDrawer({
  open,
  onClose,
  filters,
  onToggleFilter,
  onClear,
}) {
  const [openGroup, setOpenGroup] = useState(0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filter overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/35"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-[110] h-full w-[90%] max-w-[430px] overflow-y-auto bg-[#f5f1ec]"
          >
            <div className="flex h-[70px] items-center justify-between border-b border-black/10 px-5">
              <h2 className="text-[11px] uppercase tracking-[0.22em]">
                Filter
              </h2>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
              >
                <X size={23} strokeWidth={1.2} />
              </button>
            </div>

            <div>
              {filterGroups.map((group, index) => {
                const expanded = openGroup === index;

                return (
                  <div
                    key={group.key}
                    className="border-b border-black/10"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup(expanded ? null : index)
                      }
                      className="flex w-full items-center justify-between px-5 py-5 text-left"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em]">
                        {group.title}
                      </span>

                      <ChevronDown
                        size={16}
                        strokeWidth={1.3}
                        className={`transition-transform ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 px-5 pb-6">
                            {group.options.map((option) => {
                              const checked =
                                filters[group.key]?.includes(option);

                              return (
                                <label
                                  key={option}
                                  className="flex cursor-pointer items-center gap-3 text-[12px] leading-5"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked || false}
                                    onChange={() =>
                                      onToggleFilter(group.key, option)
                                    }
                                    className="h-4 w-4 shrink-0 accent-[#211c18]"
                                  />

                                  <span>{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 mt-8 grid grid-cols-2 gap-3 border-t border-black/10 bg-[#f5f1ec] p-5">
              <button
                type="button"
                onClick={onClear}
                className="border border-black/20 px-4 py-4 text-[9px] uppercase tracking-[0.18em]"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-[#211c18] px-4 py-4 text-[9px] uppercase tracking-[0.18em] text-white"
              >
                View Results
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}