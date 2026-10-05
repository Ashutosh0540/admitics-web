import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { ButtonLink } from "@/components/ui/button";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="container-page py-24 text-center">
        <p className="eyebrow mb-5">A SMALL DETOUR · 404</p>
        <h1 className="editorial text-5xl">This page isn’t on the map.</h1>
        <p className="mt-5 text-sm text-muted">
          Let’s get you back to a useful next step.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <ButtonLink href="/">Back to explore</ButtonLink>
          <ButtonLink href="/chat" variant="secondary">
            Ask Admitics
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
