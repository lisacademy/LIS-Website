import { Award, BookOpen, FlaskConical, Wrench, type LucideIcon } from "lucide-react";

export interface ProgramPage {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  icon: LucideIcon;
  accent: string;
  audience: string[];
  servicesTitle: string;
  services: { term: string; details: string }[];
}

export const academyOverview = {
  title: "About LIS Academy",
  paragraphs: [
    "LIS Academy is a professional Public Charitable Trust established to advance the Library and Information Science profession and assist libraries with state-of-the-art technology, need-based services, and continuous skill development.",
    "With the tagline Learn Inspire Serve, the Academy supports professionals with essential knowledge, skills, fair practices, innovative ideas, and cutting-edge technology.",
    "The Academy also works with higher education institutions to improve research and publication productivity and prepare for accreditation and ranking frameworks such as NBA, NAAC, and NIRF.",
  ],
  pillars: [
    "Technology support and customization",
    "Research and academic consultancy",
    "Professional development and training",
    "Career, academic, and institutional support",
    "Collaborations with institutions, associations, and government bodies",
    "Transparent, ethical, and fair professional practice",
  ],
};

export const programPages: ProgramPage[] = [
  {
    slug: "library-technology-training",
    title: "Library Technology Training Programs",
    eyebrow: "Training and Skill Development",
    summary:
      "Offline and online programs for LIS students, teachers, librarians, and information professionals focused on library technologies, digital services, and emerging trends in Library and Information Science.",
    icon: BookOpen,
    accent: "#c0392b",
    audience: ["LIS students", "Teachers", "Librarians", "Information professionals", "Libraries and institutions"],
    servicesTitle: "Major Training Programs",
    services: [
      { term: "1. Library Automation Software Training (KOHA)", details: "Comprehensive hands-on training on KOHA Integrated Library Management Software for automating circulation, cataloguing, acquisitions, serial control, and OPAC services. The program enables libraries to efficiently manage their day-to-day operations using open-source technologies." },
      { term: "2. Digital Library Development (DSpace / Greenstone)", details: "Training on designing, developing, and managing digital libraries using platforms such as DSpace and Greenstone. Participants learn digital collection creation, metadata management, content organization, and online access systems." },
      { term: "3. Institutional Repository Management", details: "Focused training on establishing and maintaining institutional repositories for theses, dissertations, research papers, and faculty publications. The program covers repository workflows, metadata standards, and open-access dissemination practices." },
      { term: "4. Library Website & Portal Development", details: "Practical guidance on creating dynamic library websites and user-friendly information portals. The training includes content management systems, web design basics, digital services integration, and online user engagement tools." },
      { term: "5. Open Source Library Technologies", details: "Exposure to various open-source tools and platforms used in modern libraries for automation, discovery, digital preservation, and resource sharing. Participants gain practical skills in adopting cost-effective technology solutions." },
      { term: "6. RFID & Smart Library Systems", details: "Training on Radio Frequency Identification (RFID) technologies and smart library applications for self-check-in/check-out, security, inventory management, and automated circulation services. The program introduces smart library infrastructure and implementation practices." },
      { term: "7. E-Resource Management Techniques", details: "Covers the acquisition, organization, access management, and usage analysis of electronic resources such as e-journals, databases, and e-books. Participants learn licensing, authentication systems, and digital access management." },
      { term: "8. Library Networking & Cloud-Based Services", details: "Training on library networking concepts, resource sharing models, and cloud-based library solutions. The program introduces collaborative platforms, remote access systems, and cloud-hosted library services for modern institutions." },
      { term: "9. Research Support Tools & Reference Management Software", details: "Hands-on sessions on tools such as Zotero, Mendeley, EndNote, and academic research platforms. The training helps professionals support researchers in citation management, literature review, and scholarly communication." },
      { term: "10. Plagiarism Detection & Academic Integrity Tools", details: "Training on plagiarism detection software, originality checking systems, and academic integrity practices. Participants learn methods for ethical research support and institutional compliance with scholarly standards." },
      { term: "11. Metadata Standards & Cataloguing Technologies", details: "Detailed orientation on metadata creation, bibliographic standards, and digital resource description practices. The program covers Dublin Core, MARC21, metadata interoperability, and automated cataloguing systems." },
      { term: "12. MARC21, RDA & Library Classification Tools", details: "Specialized training on modern cataloguing standards including MARC21 and Resource Description & Access (RDA). Participants also learn practical applications of DDC, UDC, and subject indexing tools." },
      { term: "13. Digital Preservation & Archiving Techniques", details: "Training on preserving digital content, institutional records, manuscripts, and archival collections using modern preservation standards and software tools. The program focuses on long-term accessibility and digital sustainability." },
      { term: "14. Data Analytics & AI Applications in Libraries", details: "Introduction to data-driven library services and the use of Artificial Intelligence tools in information management. Participants explore analytics for user behavior, resource utilization, and intelligent library services." },
      { term: "15. Information Retrieval & Discovery Tools", details: "Training on search technologies, discovery services, indexing systems, and advanced information retrieval techniques. The program enhances skills in improving access to scholarly and digital information resources." },
      { term: "16. Web 2.0 & Social Media Applications for Libraries", details: "Practical sessions on using blogs, social media platforms, podcasts, and collaborative technologies for library promotion and user engagement. The program supports digital outreach and community interaction strategies." },
      { term: "17. Mobile Library Applications & Digital Services", details: "Training on mobile-enabled library services, digital access platforms, and mobile applications for users. Participants learn techniques for providing library services through smartphones and portable devices." },
      { term: "18. ICT Skills for Library Professionals", details: "A foundation program covering essential Information and Communication Technology skills required for modern library professionals. Topics include office productivity tools, internet technologies, digital communication, and basic networking." },
      { term: "19. Emerging Technologies in Libraries", details: "An overview of next-generation technologies such as Artificial Intelligence, Blockchain, Internet of Things (IoT), Virtual Reality, and machine learning applications in libraries. The program prepares professionals for future-ready library services." },
      { term: "20. Hands-on Workshops on Modern Library Practices", details: "Short-term practical workshops focusing on current trends, innovative technologies, and real-time applications in libraries. These workshops emphasize experiential learning and skill enhancement for working professionals." },
    ],
  },
  {
    slug: "research-productivity-support",
    title: "Research Productivity Support Services",
    eyebrow: "Research and Publication Support",
    summary:
      "Training, workshops, seminars, and consultancy services that strengthen research capabilities, publication quality, research visibility, citation impact, and institutional research performance.",
    icon: FlaskConical,
    accent: "#e67e22",
    audience: ["Students", "Teachers", "Research scholars", "Academic institutions", "Information professionals"],
    servicesTitle: "Major Research Support Programs",
    services: [
      { term: "1. Research Methodology Training", details: "Comprehensive training on qualitative, quantitative, and mixed-method research approaches. The programme helps researchers understand research design, data collection methods, sampling techniques, and report preparation." },
      { term: "2. Academic Writing & Scholarly Communication", details: "Workshops on research paper writing, thesis preparation, literature review, technical writing, and scholarly communication practices. The training enhances clarity, structure, and academic presentation of research outputs." },
      { term: "3. Publication Support Services", details: "Guidance on identifying suitable journals, manuscript preparation, formatting, submission procedures, and responding to reviewers' comments. The programme supports quality publishing in reputed national and international journals." },
      { term: "4. Reference Management Tools Training", details: "Hands-on training on tools such as Zotero, Mendeley, EndNote, and citation management systems. Researchers learn efficient methods for organizing references, generating citations, and preparing bibliographies." },
      { term: "5. Plagiarism Awareness & Academic Integrity", details: "Training on plagiarism detection tools, ethical research practices, citation standards, and originality checking systems. The programme promotes responsible research and academic integrity in scholarly publishing." },
      { term: "6. Citation Analysis & Research Impact Assessment", details: "Workshops on citation metrics, h-index, i10-index, journal impact factors, and research analytics tools. Participants learn methods to measure and improve research visibility and scholarly impact." },
      { term: "7. Research Profiling & Academic Visibility", details: "Support for creating and managing researcher profiles on platforms such as ORCID, Google Scholar, Scopus, Vidwan, and ResearchGate. The programme helps enhance global research presence and academic networking." },
      { term: "8. Research Database & E-Resource Training", details: "Training on the effective use of research databases, indexing services, digital libraries, and e-resources such as Scopus, Web of Science, JSTOR, and Shodhganga. The programme strengthens literature search and information retrieval skills." },
      { term: "9. Research Data Management", details: "Guidance on organizing, storing, preserving, and sharing research data using appropriate standards and digital tools. The programme introduces best practices for data documentation and accessibility." },
      { term: "10. Patent, Copyright & Intellectual Property Awareness", details: "Orientation programmes on intellectual property rights, patents, copyrights, and research commercialization. Participants gain awareness about protecting scholarly and innovative work." },
      { term: "11. NAAC, NIRF & Accreditation Research Support", details: "Specialized support for institutions in improving research-related parameters required for accreditation and ranking frameworks. The programme assists in documentation, publication analysis, and research performance enhancement." },
      { term: "12. Faculty Development Programmes (FDPs)", details: "Short-term and long-term FDPs on emerging research tools, technologies, and academic practices. These programmes aim to strengthen institutional research culture and faculty competencies." },
      { term: "13. Thesis & Dissertation Support", details: "Guidance for research scholars on thesis structuring, citation styles, formatting standards, data presentation, and submission procedures. The programme supports systematic and high-quality research documentation." },
      { term: "14. Open Access & Institutional Repository Support", details: "Training on open-access publishing, repository development, self-archiving practices, and digital dissemination of institutional research outputs. The programme improves accessibility and visibility of scholarly works." },
      { term: "15. Research Collaboration & Networking Support", details: "Facilitation of academic collaborations, interdisciplinary research interactions, and professional networking opportunities. The programme encourages institutional partnerships and collaborative research initiatives." },
      { term: "16. Workshops on Emerging Research Technologies", details: "Training on AI tools, data analytics, visualization software, bibliometric tools, and digital research technologies. The programme prepares researchers for technology-enabled scholarly environments." },
      { term: "17. Research Proposal & Grant Writing Support", details: "Guidance on preparing research proposals, project reports, funding applications, and grant documentation. Participants learn techniques for presenting research ideas effectively to funding agencies." },
      { term: "18. Bibliometric & Scientometric Analysis Services", details: "Training and consultancy on publication analysis, collaboration mapping, citation patterns, and research productivity studies. The programme supports evidence-based institutional research assessment." },
      { term: "19. Journal Evaluation & Predatory Journal Awareness", details: "Workshops on identifying quality journals, avoiding predatory publishers, and understanding indexing standards. Researchers learn safe and ethical publishing practices." },
      { term: "20. Institutional Research Performance Enhancement", details: "Customized consultancy services for universities and colleges to strengthen research output, publication quality, faculty engagement, and institutional academic reputation." },
    ],
  },
  {
    slug: "institutional-technology-support",
    title: "Institutional Technology Support Services",
    eyebrow: "Technology Implementation",
    summary:
      "Implementation support, training, consultancy, and technical guidance for modern library systems, digital infrastructure, repositories, and research information services.",
    icon: Wrench,
    accent: "#27ae60",
    audience: ["Universities", "Colleges", "Research institutions", "Libraries", "Technical and library teams"],
    servicesTitle: "Major Technology Support Services",
    services: [
      { term: "KOHA Library Automation Support", details: "Implementation, customization, migration, and maintenance support for KOHA Integrated Library Management System." },
      { term: "DSpace Institutional Repository Services", details: "Development and management support for digital repositories to preserve and disseminate institutional research outputs." },
      { term: "EPrints Repository Implementation", details: "Installation, configuration, and support services for EPrints-based institutional repositories and scholarly archives." },
      { term: "IRINS Profile Management Support", details: "Assistance in implementing and managing Indian Research Information Network System (IRINS) for faculty and institutional research profiling." },
      { term: "Library Website & Portal Development", details: "Design and development of dynamic library websites, digital knowledge portals, and online information access systems." },
      { term: "Digital Library Development Services", details: "Support for creating and managing digital libraries, e-content repositories, and electronic information services." },
      { term: "Open Source Software Implementation", details: "Consultancy and deployment support for open-source library and academic technologies." },
      { term: "RFID & Smart Library Solutions", details: "Technical support for RFID-enabled circulation systems, security management, and smart library infrastructure." },
      { term: "Research Information Management Systems", details: "Development of systems for managing institutional publications, faculty profiles, research projects, and scholarly outputs." },
      { term: "Library Networking & Resource Sharing Solutions", details: "Support for networking libraries and enabling collaborative resource sharing and digital access services." },
      { term: "Metadata & Cataloguing Support Services", details: "Assistance in metadata creation, MARC21 standards, RDA implementation, and digital cataloguing practices." },
      { term: "Cloud-Based Library Solutions", details: "Support for cloud-hosted library systems, digital access platforms, and remote information services." },
      { term: "Digital Preservation & Archiving Services", details: "Solutions for preserving institutional records, rare collections, and digital scholarly resources." },
      { term: "Research Database Integration Services", details: "Integration and management support for e-resources, databases, discovery tools, and remote access systems." },
      { term: "Open Journal Systems (OJS) Support", details: "Technical assistance for implementing and managing online journal publishing platforms." },
      { term: "Open Conference Systems (OCS) Support", details: "Support for organizing and managing academic conferences through digital conference management systems." },
      { term: "Automation & Data Migration Services", details: "Assistance in retrospective conversion, data migration, and automation of existing library records and services." },
      { term: "Institutional Ranking & Accreditation Technology Support", details: "Technology-enabled support for NAAC, NIRF, NBA, and research documentation systems." },
      { term: "Training & Capacity Building Programmes", details: "Hands-on training programmes for librarians, faculty members, and technical staff on institutional technologies and digital services." },
      { term: "Customized Institutional Consultancy Services", details: "Tailored technology solutions and consultancy services based on the specific requirements of educational and research institutions." },
    ],
  },
  {
    slug: "accreditation-ranking-consultancy",
    title: "Accreditation and Ranking Consultancy Services",
    eyebrow: "Quality and Ranking Readiness",
    summary:
      "Consultancy, training, audits, and implementation support for NBA, NAAC, NIRF, and other accreditation and ranking frameworks, with emphasis on library services, research visibility, digital infrastructure, and documentation.",
    icon: Award,
    accent: "#2980b9",
    audience: ["Universities", "Colleges", "Schools", "Research institutions", "IQAC and administrative teams"],
    servicesTitle: "Major Accreditation and Ranking Services",
    services: [
      { term: "NAAC Documentation & Support Services", details: "Assistance in preparing SSRs, qualitative and quantitative metrics, library documentation, and evidence management for NAAC accreditation." },
      { term: "NBA Readiness & Quality Support", details: "Consultancy for outcome-based education documentation, academic processes, and institutional quality compliance required for NBA accreditation." },
      { term: "NIRF Ranking Support Services", details: "Guidance on improving institutional performance indicators related to research, library resources, outreach, perception, and academic productivity." },
      { term: "Library Accreditation Support", details: "Specialized consultancy for strengthening library infrastructure, services, automation, digital resources, and best practices aligned with accreditation standards." },
      { term: "Research Visibility Enhancement Services", details: "Support for improving institutional publications, citations, research profiles, and global scholarly visibility." },
      { term: "IRINS & Research Profiling Support", details: "Assistance in implementing and managing IRINS, Google Scholar, ORCID, Scopus, and other research profiling platforms." },
      { term: "Academic & Administrative Audit Support", details: "Consultancy for conducting internal academic audits, library audits, and documentation reviews to ensure quality compliance." },
      { term: "Data Collection & Validation Services", details: "Support in collecting, organizing, validating, and presenting institutional data required for accreditation and ranking submissions." },
      { term: "Institutional Repository & Digital Archive Support", details: "Development and management of repositories and digital archives to improve institutional knowledge management and visibility." },
      { term: "Library Automation & Technology Readiness", details: "Support for implementing KOHA, DSpace, RFID, and other technologies to strengthen digital infrastructure and library services." },
      { term: "Best Practices Documentation", details: "Assistance in identifying, documenting, and presenting institutional best practices, innovations, and success stories." },
      { term: "Faculty Research Performance Support", details: "Guidance for improving faculty publications, citation impact, h-index, research collaborations, and scholarly productivity." },
      { term: "E-Resource & Digital Library Support", details: "Consultancy for strengthening access to e-resources, databases, digital libraries, and online academic services." },
      { term: "Training Programmes for Accreditation Readiness", details: "Workshops, FDPs, and orientation programmes for faculty, librarians, IQAC teams, and administrators on accreditation requirements." },
      { term: "Quality Assurance & IQAC Support", details: "Assistance in strengthening Internal Quality Assurance Cell (IQAC) activities, reporting systems, and quality initiatives." },
      { term: "Institutional Website & Information Management Support", details: "Consultancy for improving institutional websites, data presentation, and digital information accessibility." },
      { term: "Benchmarking & Performance Analysis", details: "Comparative analysis of institutional performance indicators and strategic recommendations for improvement." },
      { term: "Policy Development & Strategic Planning", details: "Support in preparing institutional policies, strategic plans, and quality enhancement frameworks." },
      { term: "Mock Evaluation & Pre-Assessment Audits", details: "Conducting mock visits, readiness assessments, and gap analysis before accreditation and ranking evaluations." },
      { term: "Customized Consultancy Services", details: "Tailor-made accreditation and ranking support services based on the specific needs of universities, colleges, schools, and research institutions." },
    ],
  },
];

export const allProductsAndServices = {
  title: "Products and Services",
  summary:
    "LIS Academy offers a wide range of academic, technological, research, consultancy, and professional support services for students, librarians, teachers, researchers, educational institutions, and knowledge organizations.",
  description:
    "The products and services of LIS Academy are designed to strengthen library systems, enhance research productivity, promote digital transformation, support accreditation and ranking initiatives, and build professional competencies through training, consultancy, and collaborative programmes.",
  servicesTitle: "Major Products and Services of LIS Academy",
  services: [
    { term: "1. Library Technology Training Programmes", details: "Hands-on training programmes on KOHA, DSpace, EPrints, RFID, digital libraries, metadata standards, institutional repositories, and emerging library technologies. The programmes focus on automation, digital transformation, and ICT skill development for LIS professionals." },
    { term: "2. Research Productivity Support Services", details: "Workshops, seminars, and consultancy services aimed at improving research quality, publication output, citation impact, academic visibility, and institutional research performance. Includes training on research tools, databases, plagiarism detection, and scholarly communication." },
    { term: "3. Institutional Technology Support Services", details: "Implementation and technical support for KOHA, DSpace, EPrints, IRINS, digital repositories, library websites, and research information management systems. The services help institutions strengthen digital infrastructure and knowledge management systems." },
    { term: "4. Accreditation and Ranking Consultancy Services", details: "Consultancy support for NAAC, NBA, NIRF, and institutional quality assurance initiatives. Services include documentation support, research visibility enhancement, library readiness, data management, and strategic planning for accreditation and ranking improvement." },
    { term: "5. Library Automation & Digital Library Solutions", details: "End-to-end support for automating libraries, developing digital repositories, implementing RFID systems, and managing e-resources and online library services using open-source technologies." },
    { term: "6. Faculty Development Programmes (FDPs)", details: "Professional development programmes for teachers, librarians, researchers, and academic administrators on emerging technologies, research methodologies, digital tools, and academic best practices." },
    { term: "7. LIS Finishing School Programmes", details: "Career-oriented training programmes for LIS students and young professionals focusing on employability skills, communication, interview preparation, ICT competencies, and professional readiness." },
    { term: "8. Consultancy Services for Educational Institutions", details: "Customized consultancy services for schools, colleges, universities, and research centres in areas such as library development, digital transformation, academic planning, and institutional capacity building." },
    { term: "9. Digital Knowledge Management Services", details: "Support for institutional repositories, digital archives, content management systems, research databases, and knowledge organization tools for efficient information management." },
    { term: "10. Research Profiling & Academic Visibility Services", details: "Support for creating and managing ORCID, Google Scholar, Scopus, Vidwan, and ResearchGate profiles to improve institutional and individual research visibility." },
    { term: "11. Publication & Scholarly Communication Services", details: "Publishing support for journals, conference proceedings, newsletters, edited books, and scholarly communication initiatives. Guidance on academic publishing standards and open-access practices is also provided." },
    { term: "12. Open Journal Systems (OJS) & Open Conference Systems (OCS) Support", details: "Technical implementation and management support for online journal publishing systems and digital conference management platforms." },
    { term: "13. Workshops, Seminars & Conferences", details: "Organization of national and international conferences, seminars, webinars, workshops, conclaves, and symposiums on contemporary LIS, research, and educational themes." },
    { term: "14. Centre for Research Excellence (CRE)", details: "A dedicated research wing promoting interdisciplinary research, innovation, collaborative projects, publication support, and research capacity building in LIS and allied disciplines." },
    { term: "15. E-Resource & Database Management Support", details: "Training and consultancy on subscription management, access systems, remote authentication, usage analysis, and effective utilization of electronic resources and academic databases." },
    { term: "16. Digital Preservation & Archiving Services", details: "Support for preserving institutional records, rare collections, manuscripts, and digital scholarly content through modern preservation technologies and archival practices." },
    { term: "17. Academic Writing & Research Methodology Training", details: "Programmes focusing on academic writing, thesis preparation, proposal writing, literature review, citation management, and research design methodologies." },
    { term: "18. Bibliometric & Scientometric Analysis Services", details: "Research analytics services including citation analysis, publication mapping, collaboration studies, and institutional productivity assessment using bibliometric tools." },
    { term: "19. Institutional Repository & Open Access Services", details: "Development and management of institutional repositories to support open access, scholarly communication, and global dissemination of research outputs." },
    { term: "20. ICT & Emerging Technology Programmes", details: "Training on Artificial Intelligence, data analytics, Web technologies, cloud computing, IoT, digital tools, and other emerging technologies relevant to libraries and education sectors." },
    { term: "21. Community Networking & Professional Collaboration", details: "Professional networking initiatives, collaborative projects, academic partnerships, and platforms for interaction among LIS professionals, institutions, and researchers." },
    { term: "22. Skill Development & Capacity Building Programmes", details: "Short-term and long-term programmes aimed at strengthening professional competencies, leadership skills, technology adoption, and institutional excellence." },
    { term: "23. Customized Institutional Support Services", details: "Tailor-made services designed according to the specific academic, technological, research, and administrative requirements of educational and research institutions." },
    { term: "24. Webinar & Online Learning Platforms", details: "Regular online training programmes, webinars, virtual workshops, and digital learning initiatives for continuous professional development and wider outreach." },
    { term: "25. CSR, Outreach & Social Development Initiatives", details: "Educational outreach, literacy promotion, capacity-building activities, and socially relevant programmes undertaken through collaborative and CSR-supported initiatives." },
    { term: "26. App Development Service", details: "ABC" },
  ],
};

export function getProgramPage(slug?: string) {
  return programPages.find((program) => program.slug === slug);
}
