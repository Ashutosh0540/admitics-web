import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-7 text-muted">
            A little clarity for a big decision.
            <br />
            Your education journey starts here.
          </p>
          <Link
            href="/chat"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"
          >
            Ask Admitics <ArrowUpRight size={15} />
          </Link>
        </div>
        <div>
          <h2 className="eyebrow mb-4">Find your direction</h2>
          <ul className="grid gap-3 text-sm text-muted">
            {[
              ["Admissions", "/admissions"],
              ["Exams", "/exams"],
              ["Colleges", "/colleges"],
              ["Courses", "/courses"],
              ["Scholarships", "/scholarships"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link className="hover:text-brand" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4">Good to know</h2>
          <ul className="grid gap-3 text-sm text-muted">
            {[
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
              ["Disclaimer", "/disclaimer"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link className="hover:text-brand" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-page flex flex-col justify-between gap-3 border-t border-line py-6 text-xs leading-5 text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} Admitics. Made for your next chapter.
        </p>
        <p>Guidance, not guarantees. Always confirm with official sources.</p>
      </div>
    </footer>
  );
}
