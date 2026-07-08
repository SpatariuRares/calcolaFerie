import { VacationPlanner } from "./_components/vacation-planner";

export default function Home() {
  return (
    <>
      <VacationPlanner />
      <section aria-label="Informazioni sul calcolatore">
        <h2>Calcolatore ponti ferie italiane</h2>
        <p>
          Ottimizza le tue ferie sfruttando le festività italiane: inserisci il tuo budget di giorni
          e scopri i ponti migliori per massimizzare i giorni di vacanza con il minimo di ferie
          spese. Ideale per ottimizzare ferie e ponti durante tutto l&apos;anno.
        </p>
      </section>
    </>
  );
}
