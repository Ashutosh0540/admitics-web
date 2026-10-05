export const information = {
  about: {
    title: "A clearer next chapter.",
    eyebrow: "ABOUT ADMITICS",
    description:
      "Education decisions are big. Finding a useful next step shouldn't have to be.",
    sections: [
      {
        title: "Built around your questions",
        body: "Admitics is an AI-powered education and admissions guidance product for students and parents. It brings conversations, admissions information, and document context into one calm, approachable space.",
      },
      {
        title: "Thoughtful guidance",
        body: "The goal is to help you understand possibilities, ask better questions, and build a practical plan. Guidance should acknowledge uncertainty and point back to real evidence when it is available.",
      },
      {
        title: "A product in preview",
        body: "This frontend currently offers a local preview adapter. Live AI guidance, server-persisted conversations, and document analysis become available when the separate Admitics API is connected.",
      },
    ],
  },
  contact: {
    title: "Let’s find your next step.",
    eyebrow: "CONTACT",
    description:
      "Have an admissions question? Start with your advisor. Need product support? The support channel will be published before launch.",
    sections: [
      {
        title: "Education and admissions questions",
        body: "Ask Admitics to explore a course, understand an exam, or build an application checklist. Confirm institution-specific requirements with the relevant official admissions office.",
      },
      {
        title: "Product support",
        body: "An official support email and contact details are pending owner confirmation. This preview does not send contact messages or collect contact form submissions.",
      },
    ],
  },
  privacy: {
    title: "Your privacy matters.",
    eyebrow: "PRIVACY · PRE-LAUNCH DRAFT",
    description:
      "This preview notice describes the frontend milestone. The product owner must approve a complete policy before public launch.",
    sections: [
      {
        title: "Local preview data",
        body: "Preview conversations, document metadata, and preview identity details are stored in this browser's local storage. Document contents are not uploaded or processed in mock mode. You can remove individual conversations and documents through the interface or clear site data in your browser.",
      },
      {
        title: "Connected product",
        body: "When configured, Supabase handles authentication and session storage. Authenticated application requests go to the separate Admitics API. Application data and documents are managed by that backend, not by a frontend database.",
      },
      {
        title: "Pending policy details",
        body: "Retention periods, controller contact information, subprocessors, legal bases, international transfers, and data-access/deletion procedures must be finalized by the product owner. No retention or compliance guarantee is made by this preview notice.",
      },
    ],
  },
  terms: {
    title: "A thoughtful starting point.",
    eyebrow: "TERMS · PRE-LAUNCH DRAFT",
    description:
      "These preliminary terms explain the preview. Complete terms require product-owner and legal review before launch.",
    sections: [
      {
        title: "Use of guidance",
        body: "Admitics helps you explore education and admissions. Guidance is informational and does not guarantee eligibility, admission, scholarship awards, exam performance, or any particular outcome.",
      },
      {
        title: "Confirm important decisions",
        body: "Always confirm application rules, fees, dates, recognition, and eligibility directly with the responsible institution or official authority. AI-generated responses can contain mistakes.",
      },
      {
        title: "Preview limitations",
        body: "Local mock responses and document states are examples. The preview does not provide live AI inference or document analysis. Commercial terms, dispute procedures, and the legal contracting entity are pending owner approval.",
      },
    ],
  },
  disclaimer: {
    title: "Guidance, with perspective.",
    eyebrow: "HOW TO USE ADMITICS",
    description:
      "A good plan uses guidance thoughtfully and checks the details that matter.",
    sections: [
      {
        title: "Official information comes first",
        body: "Admissions rules, dates, and scholarship requirements change. The latest official notice, institution website, or responsible authority is the source of truth for your application.",
      },
      {
        title: "Evidence and uncertainty",
        body: "Source links are presented when available. A link alone does not mean that every claim has been verified. Preview reference cards are example links, not evidence retrieved for your question. Unsupported answers should be treated as unverified.",
      },
      {
        title: "Use your judgment",
        body: "Admitics is an informational guide, not an admissions authority or a substitute for individualized professional advice. Check consequential decisions with the institution and a qualified advisor where appropriate.",
      },
    ],
  },
} as const;
export type InformationSlug = keyof typeof information;
export function isInformation(value: string): value is InformationSlug {
  return Object.hasOwn(information, value);
}
