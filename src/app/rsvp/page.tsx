import { wedding } from "@/config/wedding";
import { RsvpForm } from "@/components/RsvpForm";

export const metadata = { title: "Confirmar Presença" };

export default function RsvpPage() {
  return (
    <div className="container-page py-16">
      <header className="mb-10 text-center">
        <h1 className="section-title">Confirme sua Presença</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">
          {wedding.rsvp.deadlineLabel}
        </p>
      </header>
      <div className="mx-auto max-w-lg">
        <RsvpForm maxCompanions={wedding.rsvp.maxCompanions} />
      </div>
    </div>
  );
}
