export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-[720px] text-center" : "max-w-[720px]"}>
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8A786A] sm:text-[12px]">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-4 font-serif text-[36px] font-light leading-[0.98] tracking-[-0.03em] text-[#2F241D] sm:text-[44px] md:text-[52px] lg:text-[60px]">
        {title}
      </h2>

      {description && (
        <p
          className={
            align === "center"
              ? "mx-auto mt-5 max-w-[620px] text-[16px] leading-[1.75] text-[#6E5F53] sm:text-[17px] md:text-[18px]"
              : "mt-5 max-w-[620px] text-[16px] leading-[1.75] text-[#6E5F53] sm:text-[17px] md:text-[18px]"
          }
        >
          {description}
        </p>
      )}
    </div>
  );
}
