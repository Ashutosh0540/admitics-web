import type { ContentEntry } from "./types";

// Starter editorial data, not an admissions feed. No active dates, current fees,
// cut-offs, eligibility promises, or claims of verification are included.
export const examples: ContentEntry[] = [
  {
    category: "exams",
    slug: "jee-main",
    title: "JEE Main",
    subtitle: "Joint Entrance Examination",
    tag: "Engineering",
    summary:
      "An entrance pathway for engineering and related undergraduate programs at participating institutions.",
    facts: [
      { label: "Area", value: "Engineering & related programs" },
      { label: "Organizer", value: "National Testing Agency" },
    ],
    overview:
      "JEE Main is associated with admissions to participating engineering institutions and may form part of other admission pathways. Paper choice, academic eligibility, and admission criteria depend on the program and institution.",
    checkpoints: [
      "Read the current information bulletin and choose the right paper.",
      "Check the required subjects and qualifying-exam criteria.",
      "Confirm the institution's counseling and admission process.",
    ],
    source: { title: "National Testing Agency", url: "https://www.nta.ac.in/" },
  },
  {
    category: "exams",
    slug: "cuet-ug",
    title: "CUET (UG)",
    subtitle: "Common University Entrance Test",
    tag: "Multiple streams",
    summary:
      "Explore the test used for undergraduate admissions at participating universities across a range of subjects.",
    facts: [
      { label: "Level", value: "Undergraduate" },
      { label: "Organizer", value: "National Testing Agency" },
    ],
    overview:
      "CUET (UG) is an entrance pathway used by participating universities. The subject combination required for a particular course must be checked with the university; taking the test does not itself establish eligibility or guarantee admission.",
    checkpoints: [
      "Shortlist universities and specific programs first.",
      "Confirm required test subjects with each university.",
      "Track test registration and the university's separate admission steps.",
    ],
    source: { title: "National Testing Agency", url: "https://www.nta.ac.in/" },
  },
  {
    category: "exams",
    slug: "neet-ug",
    title: "NEET (UG)",
    subtitle: "National Eligibility cum Entrance Test",
    tag: "Medicine",
    summary:
      "A starting point for understanding the entrance pathway associated with undergraduate medical admissions.",
    facts: [
      { label: "Area", value: "Medical & related programs" },
      { label: "Organizer", value: "National Testing Agency" },
    ],
    overview:
      "NEET (UG) is associated with undergraduate medical and certain related admission pathways. Program eligibility, counseling rules, and seat allocation should be confirmed with the relevant official authorities.",
    checkpoints: [
      "Review the current academic and subject eligibility rules.",
      "Read the official exam notice and information bulletin.",
      "Understand the relevant national and state counseling procedures.",
    ],
    source: { title: "National Testing Agency", url: "https://www.nta.ac.in/" },
  },
  {
    category: "colleges",
    slug: "iit-bombay",
    title: "IIT Bombay",
    subtitle: "Mumbai, Maharashtra",
    tag: "Engineering",
    summary:
      "Explore a public institute with programs in engineering, sciences, design, and other disciplines.",
    facts: [
      { label: "Location", value: "Mumbai" },
      { label: "Institution", value: "Indian Institute of Technology" },
    ],
    overview:
      "The Indian Institute of Technology Bombay offers programs across several disciplines. Admission routes vary considerably between undergraduate, postgraduate, research, and design programs. Begin with the program's own official admissions page.",
    checkpoints: [
      "Compare the curriculum of the specific program you want.",
      "Confirm its entrance and counseling pathway.",
      "Review official information on fees, student support, and campus life.",
    ],
    source: { title: "IIT Bombay", url: "https://www.iitb.ac.in/" },
  },
  {
    category: "colleges",
    slug: "university-of-delhi",
    title: "University of Delhi",
    subtitle: "Delhi",
    tag: "Multiple streams",
    summary:
      "Explore a university and its participating colleges across arts, commerce, sciences, and other fields.",
    facts: [
      { label: "Location", value: "Delhi" },
      { label: "Institution", value: "Central university" },
    ],
    overview:
      "The University of Delhi includes a network of colleges and departments with a wide range of programs. Course eligibility, participating colleges, and admission processes should be checked in the current university admission material.",
    checkpoints: [
      "Compare the same course across different colleges.",
      "Check required subject combinations and current admission steps.",
      "Consider commute, accommodation, and student support alongside academics.",
    ],
    source: { title: "University of Delhi", url: "https://www.du.ac.in/" },
  },
  {
    category: "colleges",
    slug: "national-institute-of-design",
    title: "National Institute of Design",
    subtitle: "Ahmedabad, Gujarat",
    tag: "Design",
    summary:
      "A starting point for exploring design education and its distinct entrance and portfolio expectations.",
    facts: [
      { label: "Area", value: "Design" },
      { label: "Location", value: "Ahmedabad" },
    ],
    overview:
      "The National Institute of Design offers design programs with their own admission pathways. Program offerings and campus-specific details vary. Use the institute's official site to understand the current application and selection process.",
    checkpoints: [
      "Read about design disciplines and studio-based learning.",
      "Check the current entrance and selection process.",
      "Confirm which campus offers the program you're considering.",
    ],
    source: {
      title: "National Institute of Design",
      url: "https://www.nid.edu/",
    },
  },
  {
    category: "courses",
    slug: "btech",
    title: "B.Tech",
    subtitle: "Bachelor of Technology",
    tag: "Engineering",
    summary:
      "Build technical foundations and explore how engineering connects to real-world problems.",
    facts: [
      { label: "Level", value: "Undergraduate" },
      {
        label: "Duration",
        value: "Commonly four years; confirm with institute",
      },
    ],
    overview:
      "A B.Tech program generally combines mathematical and scientific foundations with a chosen engineering discipline, practical work, and projects. Curricula and admission requirements differ by institution and specialization.",
    checkpoints: [
      "Compare specializations by curriculum, not just their titles.",
      "Check academic prerequisites and entrance routes.",
      "Look for labs, project opportunities, internships, and accreditation details.",
    ],
    source: { title: "AICTE", url: "https://www.aicte-india.org/" },
  },
  {
    category: "courses",
    slug: "economics",
    title: "Economics",
    subtitle: "Undergraduate study pathways",
    tag: "Arts & sciences",
    summary:
      "Understand incentives, markets, policy, and the choices shaping societies and everyday life.",
    facts: [
      { label: "Level", value: "Undergraduate" },
      { label: "Award", value: "Varies by university and program" },
    ],
    overview:
      "Undergraduate economics programs can include economic theory, quantitative methods, statistics, and policy. Some programs require mathematics or specific test subjects. Compare the precise curriculum and award offered by each university.",
    checkpoints: [
      "Review the mathematics and statistics components.",
      "Check subject prerequisites for each university.",
      "Explore research, policy, and further-study pathways.",
    ],
    source: {
      title: "University Grants Commission",
      url: "https://www.ugc.gov.in/",
    },
  },
  {
    category: "courses",
    slug: "bdes",
    title: "B.Des",
    subtitle: "Bachelor of Design",
    tag: "Design",
    summary:
      "Explore creative problem-solving, design research, and hands-on studio learning.",
    facts: [
      { label: "Level", value: "Undergraduate" },
      {
        label: "Duration",
        value: "Commonly four years; confirm with institute",
      },
    ],
    overview:
      "A Bachelor of Design can include studio practice, design thinking, research, and specialization-specific skills. Entrance expectations and available disciplines differ between institutions. Portfolio requirements should be checked directly, not assumed.",
    checkpoints: [
      "Explore disciplines such as product, communication, or interaction design.",
      "Understand the institution's selection process.",
      "Review studio facilities and examples of student work.",
    ],
    source: {
      title: "National Institute of Design",
      url: "https://www.nid.edu/",
    },
  },
  {
    category: "scholarships",
    slug: "national-scholarship-portal",
    title: "National Scholarship Portal",
    subtitle: "A place to discover government schemes",
    tag: "Government support",
    summary:
      "Explore multiple schemes in one portal and check which criteria fit your circumstances.",
    facts: [
      { label: "Type", value: "Scholarship portal" },
      { label: "Criteria", value: "Scheme-specific" },
    ],
    overview:
      "The National Scholarship Portal hosts information and application workflows for various schemes. It is not one universal scholarship. Each scheme may have distinct eligibility criteria, required documents, and application windows.",
    checkpoints: [
      "Identify a specific scheme before preparing an application.",
      "Check income, academic, domicile, and category criteria where relevant.",
      "Confirm the current deadline and institution verification requirements.",
    ],
    source: {
      title: "National Scholarship Portal",
      url: "https://scholarships.gov.in/",
    },
  },
  {
    category: "scholarships",
    slug: "aicte-pragati",
    title: "AICTE Pragati",
    subtitle: "Support for eligible women in technical education",
    tag: "Technical education",
    summary:
      "A starting point for checking the official scheme rules and current application process.",
    facts: [
      { label: "Administered by", value: "AICTE" },
      { label: "Eligibility", value: "Check current scheme guidelines" },
    ],
    overview:
      "AICTE's Pragati scheme is associated with support for eligible women in technical education. Qualification level, institution approval, income criteria, and application details must be verified against the current official guidelines.",
    checkpoints: [
      "Read the current scheme guidelines on the official site.",
      "Confirm your institution and program qualify.",
      "Check required certificates and the active application process.",
    ],
    source: { title: "AICTE", url: "https://www.aicte-india.org/" },
  },
  {
    category: "scholarships",
    slug: "inspire",
    title: "INSPIRE",
    subtitle: "Explore support for basic and natural sciences",
    tag: "Science",
    summary:
      "Understand the program and check the official criteria for the relevant scholarship component.",
    facts: [
      { label: "Area", value: "Basic & natural sciences" },
      { label: "Criteria", value: "Component-specific" },
    ],
    overview:
      "INSPIRE is a Department of Science and Technology initiative with distinct components. Scholarship eligibility and supported courses should be checked for the specific component you intend to apply to.",
    checkpoints: [
      "Choose the relevant INSPIRE component.",
      "Check supported programs and official eligibility criteria.",
      "Verify current notices, documents, and application dates.",
    ],
    source: {
      title: "INSPIRE official portal",
      url: "https://online-inspire.gov.in/",
    },
  },
];
