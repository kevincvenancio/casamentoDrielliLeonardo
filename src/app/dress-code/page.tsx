import { wedding } from "@/config/wedding";

export const metadata = { title: "Dress Code" };

export default function DressCodePage() {
  const { dressCode } = wedding;

  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">{dressCode.title}</h1>
        <p className="mt-4 font-serif text-2xl text-ink">{dressCode.style}</p>
        <p className="mx-auto mt-4 max-w-2xl text-stone">{dressCode.intro}</p>
      </header>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-sand bg-white p-8">
          <p className="text-xs uppercase tracking-widest text-stone">Elas</p>
          <p className="mt-3 text-stone">{dressCode.women}</p>
        </div>
        <div className="rounded-2xl border border-sand bg-white p-8">
          <p className="text-xs uppercase tracking-widest text-stone">Eles</p>
          <p className="mt-3 text-stone">{dressCode.men}</p>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-sand bg-white p-8">
        <p className="text-xs uppercase tracking-widest text-stone">
          Cores a evitar
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {dressCode.avoidColors.map((color) => (
            <li key={color.label} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-7 w-7 shrink-0 rounded-full border border-sand"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-stone">{color.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-stone">{dressCode.avoidNote}</p>
      </div>
    </div>
  );
}
