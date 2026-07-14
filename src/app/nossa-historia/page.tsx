import { wedding } from "@/config/wedding";

export const metadata = { title: "Nossa Historia" };

export default function StoryPage() {
  const { story } = wedding;
  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">{story.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">{story.intro}</p>
      </header>

      <ol className="relative mx-auto max-w-2xl border-l border-sand pl-8">
        {story.timeline.map((item, i) => (
          <li key={i} className="mb-10 last:mb-0">
            <span className="absolute -left-2.5 mt-1 h-5 w-5 rounded-full border-2 border-cream bg-stone" />
            <p className="font-serif text-2xl text-ink">{item.year}</p>
            <h3 className="mt-1 text-lg font-medium">{item.title}</h3>
            <p className="mt-1 text-stone">{item.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
