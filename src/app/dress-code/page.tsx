import { wedding } from "@/config/wedding";

export const metadata = { title: "Dress Code" };

export default function DressCodePage() {
  const { dressCode } = wedding;
  const looks = [
    { label: "Elas", texto: dressCode.women, foto: dressCode.womenPhotos[0] },
    { label: "Eles", texto: dressCode.men, foto: dressCode.menPhotos[0] },
  ];

  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">{dressCode.title}</h1>
        <p className="mt-4 font-serif text-2xl text-ink">{dressCode.style}</p>
        <p className="mx-auto mt-4 max-w-2xl text-stone">{dressCode.intro}</p>
      </header>

      {/* Guia por publico: a orientacao em texto e a foto de referencia ficam
          em blocos separados, com a foto num quadro uniforme (3:4). */}
      <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
        {looks.map((look) => (
          <figure key={look.label} className="text-center">
            {look.foto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={look.foto.src}
                alt={look.foto.alt}
                className="aspect-[3/4] w-full rounded-2xl border border-sand object-cover"
                loading="lazy"
              />
            )}
            <figcaption className="mt-4">
              <p className="text-xs uppercase tracking-widest text-stone">
                {look.label}
              </p>
              <p className="mt-1 text-stone">{look.texto}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Cores a evitar */}
      <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-sand bg-white p-8">
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

      {/* Inspiracao de cores */}
      {dressCode.palettePhoto && (
        <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-sand bg-white">
          <div className="p-8 pb-6">
            <p className="text-xs uppercase tracking-widest text-stone">
              Inspiração de cores
            </p>
            <p className="mt-3 text-stone">
              Fora as cores acima, sinta-se livre. Vale de verde a vinho,
              passando por azul, mostarda e terracota.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dressCode.palettePhoto.src}
            alt={dressCode.palettePhoto.alt}
            className="w-full bg-sand"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
