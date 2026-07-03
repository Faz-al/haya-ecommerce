export default function AnnouncementBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex h-[35px] items-center justify-center bg-black px-4 text-white">
      <a
        href="#"
        className="text-[9px] font-medium uppercase tracking-[0.04em] underline underline-offset-2 sm:text-[10px]"
      >
        Enjoy 10% off your first order
      </a>
    </div>
  );
}