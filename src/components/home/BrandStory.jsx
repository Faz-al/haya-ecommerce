export default function BrandStory() {
  return (
    <section className="grid lg:grid-cols-2 bg-[#eee8e1]">
      <div className="min-h-[320px] lg:min-h-[420px] px-8 lg:px-32 py-16 flex flex-col justify-center">
        <p className="text-[11px] uppercase tracking-[0.28em] mb-5">Our Philosophy</p>
        <h2 className="font-serif text-4xl lg:text-6xl leading-tight">
          Elegance in<br />Simplicity
        </h2>
        <a className="mt-8 text-[11px] uppercase underline tracking-[0.18em]">Discover Our Story</a>
      </div>

      <img
        src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
        alt="Brand story"
        className="h-[320px] lg:h-[420px] object-cover"
      />
    </section>
  );
}