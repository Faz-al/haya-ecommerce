import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F7F3EE]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="font-serif text-5xl md:text-7xl font-light tracking-[0.28em] text-[#1E1E1E]"
        >
          Haya
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-5 text-[11px] uppercase tracking-[0.5em] text-[#8D7867]"
        >
          Timeless Modest Fashion
        </motion.p>

        <div className="mx-auto mt-12 h-[2px] w-52 overflow-hidden rounded-full bg-[#DED5CC]">
          <motion.div
            className="h-full w-24 bg-[#A98563]"
            animate={{ x: ["-110%", "250%"] }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

      </div>
    </motion.div>
  );
}
