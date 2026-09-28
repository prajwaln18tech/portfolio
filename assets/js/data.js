// Single source of truth for profile facts used by the terminal, search and palette.

export const PROFILE = {
  name: 'Prajwal Narayanaswamy',
  role: 'Software Engineer',
  email: 'prajwalnarayanaswamy8@gmail.com',
  github: 'https://github.com/prajwaln18tech',
  linkedin: 'https://www.linkedin.com/in/prajwal-narayanaswamy-2025041a0/',
  resume: 'assets/Prajwal_Narayanaswamy_Resume.pdf',
  paper: 'https://dl.acm.org/doi/abs/10.5555/3787712.3787735',
  narratorCode: 'https://gitlab.com/prajwalnec053/ai-assisted_contextual_code_narration_project',
  repo: 'https://github.com/prajwaln18tech/portfolio',
};

export const SECTIONS = {
  about: '#about',
  experience: '#experience',
  work: '#work',
  ask: '#ask',
  stack: '#skills',
  education: '#education',
  contact: '#contact',
  colophon: '#colophon',
};

export const SKILLS = {
  languages: ['Python', 'TypeScript', 'JavaScript', 'C++', 'SQL', 'HTML', 'CSS'],
  frameworks: ['FastAPI', 'React 19', 'Vite', 'Tailwind CSS', 'Recharts', 'Node.js', 'Django Channels', 'Pandas', 'NumPy', 'Selenium'],
  ai: ['Azure OpenAI', 'GPT-4', 'RAG', 'Prompt engineering', 'Embeddings', 'Semantic search', 'Sentence-Transformers', 'scikit-learn', 'NLP'],
  cloud: ['Azure App Service', 'Container Apps', 'Front Door', 'Entra ID', 'GCP', 'Docker', 'Kubernetes', 'GitHub Actions', 'Azure DevOps', 'Bicep', 'Linux'],
  data: ['Informatica PowerCenter', 'Oracle', 'SQL Server', 'MySQL', 'SQLite', 'Data warehousing', 'ETL tuning'],
  quality: ['pytest', 'Playwright', 'axe-core', 'E2E testing', 'Regression testing', 'WCAG 2.1 AA', 'AuthN / AuthZ'],
};

export const JOBS = [
  { when: 'Sep 2025 – Sep 2026', title: 'Web Developer', org: 'Microsoft — World’s Edge (via Experis)', note: 'Price Tool + Review Tool platforms' },
  { when: 'Feb 2024 – Oct 2024', title: 'Instructional Student Assistant', org: 'California State University, Chico', note: 'ML + data pipelines for research' },
  { when: 'Nov 2021 – Jul 2022', title: 'Programmer Analyst Trainee', org: 'Cognizant Technology Solutions', note: 'Informatica ETL + SQL tuning' },
];

export const PUBLICATIONS = [
  {
    title: 'AI-Assisted Contextual Code Narration for the Visually Impaired',
    authors: 'P. Narayanaswamy, A. Attarwala, P. Viotti, J. Raigoza, E. Lindoo',
    venue: 'Journal of Computing Sciences in Colleges 41(4), pp. 77–89 · Sep 2025',
    url: 'https://dl.acm.org/doi/abs/10.5555/3787712.3787735',
    code: 'https://gitlab.com/prajwalnec053/ai-assisted_contextual_code_narration_project',
  },
];

export const PROJECTS = [
  { name: 'World’s Edge Price Tool', what: 'Game-pricing intelligence across 92 markets / 47 currencies', stack: 'FastAPI · React 19 · Azure' },
  { name: 'World’s Edge Review Tool', what: 'AI analytics over 100K+ reviews in 29 languages', stack: 'Sentence-Transformers · RAG · Azure OpenAI' },
  { name: 'Accessible Code Narrator', what: 'VS Code extension narrating code for visually impaired devs · published in JCSC 2025', stack: 'TypeScript · Python · GPT-4 · ElevenLabs' },
  { name: 'Multiplayer Chess Platform', what: 'Real-time chess, <100ms latency, 500+ concurrent users', stack: 'Django Channels · WebSockets · GKE' },
];

// Knowledge base for "Ask my résumé". Each passage is small and self-contained so retrieval stays precise.
export const KB = [
  { id: 'summary', section: 'about', title: 'Summary', text: 'Prajwal is a software developer with 2+ years of experience designing, building and deploying cloud-native web applications, Generative AI / LLM solutions and ETL data pipelines, across the full software development lifecycle.' },
  { id: 'focus', section: 'about', title: 'What he’s looking for', text: 'He is open to software engineering roles in full-stack development, AI/LLM product engineering, or cloud platform work. The best way to reach him is email.' },
  { id: 'core', section: 'about', title: 'Core stack', text: 'His core stack is Python, FastAPI, React, TypeScript, SQL and Microsoft Azure, with experience in Azure OpenAI, RAG, semantic search, REST API design, Docker, CI/CD, automated testing, API security and WCAG accessibility.' },

  { id: 'ms-role', section: 'experience', title: 'Microsoft — World’s Edge', text: 'From September 2025 to September 2026 he worked as a Web Developer at Microsoft’s World’s Edge studio (via Experis), building two production platforms: a regional game-pricing tool and an AI-powered review analytics tool.' },
  { id: 'price-1', section: 'work', title: 'Price Tool — platform', text: 'He built and deployed an end-to-end pricing-intelligence platform with Python, FastAPI and React 19 + TypeScript that pulls game prices from Xbox, Steam and PlayStation across 92 markets and 47 currencies, normalizes them to tax-free USD, benchmarks them against US pricing and produces Excel reports.' },
  { id: 'price-2', section: 'work', title: 'Price Tool — web scraping', text: 'He engineered resilient multi-store web scrapers using the Xbox Display Catalog API, the Steam API and concurrent parsing of 68 PlayStation locales, with exponential back-off, a Selenium fallback, an asynchronous job queue, a background worker and rate limiting.' },
  { id: 'price-3', section: 'work', title: 'Price Tool — cloud & DevOps', text: 'He deployed the platform on Azure App Service behind Azure Front Door with a web application firewall (WAF) and Microsoft Entra ID sign-in, wrote Bicep infrastructure-as-code for Azure Container Apps, and automated CI/CD pipelines in GitHub Actions and Azure DevOps.' },
  { id: 'price-4', section: 'work', title: 'Price Tool — security fix', text: 'He remediated a reported production security vulnerability by enforcing fail-closed Entra ID and API-key authentication on every endpoint, backed by a 48-case regression test suite.' },
  { id: 'price-5', section: 'work', title: 'Price Tool — accessibility', text: 'He brought the app to WCAG 2.1 AA accessibility compliance, verified with automated Playwright and axe-core tests across 6 app states and 5 screen sizes.' },
  { id: 'review-1', section: 'work', title: 'Review Tool — migration', text: 'He migrated a single-user Windows desktop tool into a multi-user web application (FastAPI, React 19 + TypeScript, Tailwind CSS, Recharts) with 25 REST endpoints, analyzing 100,000+ player reviews in 29 languages. It was adopted by teams beyond the studio.' },
  { id: 'review-2', section: 'work', title: 'Review Tool — semantic search', text: 'He built multilingual semantic search with Sentence-Transformers embeddings and a content-addressed vector store that only encodes new or changed text, and replaced about 227K per-pair similarity calculations with a single vectorized matrix operation.' },
  { id: 'review-3', section: 'work', title: 'Review Tool — insights & clustering', text: 'He designed automated insight detection, such as sentiment drops by language and negative-topic spikes, plus hybrid topic discovery that combines semantic matching, MiniBatchKMeans clustering and Azure OpenAI cluster labeling.' },
  { id: 'review-4', section: 'work', title: 'Review Tool — LLM features', text: 'He built LLM features by integrating Azure OpenAI (GPT) for grounded RAG-style question answering, bilingual reply drafting and theme analysis, with prompt-injection safeguards.' },
  { id: 'review-5', section: 'work', title: 'Review Tool — testing & performance', text: 'He shipped the Review Tool through Docker-based CI/CD with 216 automated pytest tests, and added single-flight caching that halved cold-start work.' },

  { id: 'csu', section: 'experience', title: 'Cal State Chico — research assistant', text: 'From February to October 2024 he was an Instructional Student Assistant at California State University, Chico, collecting and analyzing research data for faculty with machine learning and statistical methods, building Python (Pandas, NumPy) preprocessing pipelines, and creating data visualizations.' },
  { id: 'cts-1', section: 'experience', title: 'Cognizant — ETL', text: 'From November 2021 to July 2022 he was a Programmer Analyst Trainee at Cognizant in Bengaluru, developing complex ETL workflows in Informatica PowerCenter that loaded large datasets from flat files, Oracle, SQL Server and mainframe systems into data warehouses.' },
  { id: 'cts-2', section: 'experience', title: 'Cognizant — performance & data quality', text: 'At Cognizant he optimized ETL performance with session partitioning, pushdown optimization and parallel processing, applied SQL validation and cleansing rules for data quality, and did root cause analysis of pipeline failures through log analysis and SQL tuning, working with data architects, business analysts and QA teams.' },

  { id: 'narrator', section: 'work', title: 'Accessible Code Narrator', text: 'Accessible Code Narrator is a VS Code extension that narrates C++ code for blind and visually impaired developers. The TypeScript extension drives a Python pipeline that uses the GPT-4 LLM for structure-first explanations and the ElevenLabs text-to-speech API for two distinct voices (one reads code verbatim, the other gives context), stitched together with ffmpeg, reaching 95% code-to-speech accuracy. The source code is on GitLab.' },
  { id: 'paper', section: 'education', title: 'Publication — JCSC 2025', text: 'Prajwal is first author of the peer-reviewed research paper "AI-Assisted Contextual Code Narration for the Visually Impaired", published in the Journal of Computing Sciences in Colleges, volume 41, issue 4, pages 77–89, in September 2025 (ACM Digital Library), with co-authors Abbas Attarwala, Paul Viotti, Jaime Raigoza and Ed Lindoo. The research uses large language models and prompt engineering to make source code accessible to blind programmers.' },
  { id: 'chess', section: 'work', title: 'Multiplayer Chess Platform', text: 'He built a cloud-native real-time multiplayer chess platform with Django Channels and WebSockets, with under 100ms latency and 500+ concurrent users, deployed on Google Cloud (GCP) Kubernetes with 99.9% uptime.' },

  { id: 'sk-lang', section: 'stack', title: 'Languages', text: 'Programming languages: Python, TypeScript, JavaScript, C++, SQL, HTML and CSS.' },
  { id: 'sk-fw', section: 'stack', title: 'Frameworks & libraries', text: 'Frameworks and libraries: FastAPI, React 19, Vite, Tailwind CSS, Recharts, Node.js, Django Channels, Pandas, NumPy and Selenium.' },
  { id: 'sk-ai', section: 'stack', title: 'AI / ML & LLMs', text: 'AI, machine learning and LLM skills: Azure OpenAI, GPT-4, retrieval-augmented generation (RAG), prompt engineering, Sentence-Transformers, embeddings, semantic search, scikit-learn and NLP.' },
  { id: 'sk-cloud', section: 'stack', title: 'Cloud & DevOps', text: 'Cloud and DevOps: Microsoft Azure (App Service, Container Apps, Front Door, Entra ID), Google Cloud Platform, Docker, Kubernetes, GitHub Actions, Azure DevOps, Bicep and Linux.' },
  { id: 'sk-data', section: 'stack', title: 'Data & ETL', text: 'Data and ETL: Informatica PowerCenter, Oracle, SQL Server, MySQL, SQLite, data warehousing, ETL tuning, data preprocessing and data visualization.' },
  { id: 'sk-qa', section: 'stack', title: 'Testing & security', text: 'Testing and security: pytest, Playwright, axe-core, unit, integration and end-to-end testing, regression testing, WCAG 2.1 AA accessibility and authentication.' },

  { id: 'edu-ms', section: 'education', title: 'MS in Computer Science', text: 'He earned a Master of Science in Computer Science from California State University, Chico (August 2023 – August 2025), with coursework in algorithms, data science, cybersecurity, digital forensics, web technology and computer networks.' },
  { id: 'edu-be', section: 'education', title: 'BE in Electronics & Communication', text: 'He holds a Bachelor of Engineering in Electronics and Communication from Visvesvaraya Technological University (2017 – 2021).' },
  { id: 'certs', section: 'education', title: 'Certifications', text: 'Certifications: Google Cybersecurity Professional (Coursera), Python Data Structures from the University of Michigan (Coursera), and IT Project Management.' },
  { id: 'awards', section: 'education', title: 'Awards', text: 'Awards: 3rd Prize in the NASA Ames Space Settlement Design Contest, the Student Achievement Award at the International Space Development Conference (ISDC 2014), and semifinalist in the DST & Texas Instruments India Innovation Challenge (2019).' },
  { id: 'contact', section: 'contact', title: 'Contact', text: 'You can contact Prajwal by email at prajwalnarayanaswamy8@gmail.com, or through LinkedIn and GitHub (prajwaln18tech). His résumé is available as a PDF.' },
];
