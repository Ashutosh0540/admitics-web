"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "4rem 2rem",
          fontFamily: "system-ui",
          color: "#192c28",
          background: "#fafaf6",
        }}
      >
        <main>
          <h1>We couldn’t open Admitics.</h1>
          <p>
            Please try again. Your saved conversations are still in your browser
            in preview mode.
          </p>
          <button
            onClick={reset}
            style={{ padding: ".75rem 1rem", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
