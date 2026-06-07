export const TRUSTEE_IMAGE_VERSION = "20260607-1";

export interface GovernanceMember {
  name: string;
  role: string;
  photo?: string;
  imagePosition?: string;
}

export type GovernanceTabId = "founder" | "invited" | "advisory";

export interface GovernanceTab {
  id: GovernanceTabId;
  label: string;
  data: GovernanceMember[];
}

export const founderTrustees: GovernanceMember[] = [
  {
    name: "Dr. P. V. Konnur",
    role: "President, LIS Academy, Bangalore",
    photo: "/lisa-trustees/pv-konnur.png",
  },
  {
    name: "Dr. S. Srinivasa Ragavan",
    role: "Professor & University Librarian, Bharathidasan University, Trichy",
    photo: "/lisa-trustees/srinivasa-ragavan.jpg",
  },
  {
    name: "Dr. Arun Adrakatti",
    role: "Deputy Librarian, National Institute of Technology Calicut, Kozhikode, Kerala",
    photo: "/lisa-trustees/arun-adrakatti.jpg",
  },
  {
    name: "D.T.A.Mohan",
    role: "University Librarian, Doctor Harisingh Gour Vishwavidyalaya, Sagar",
    photo: "/lisa-trustees/ta-mohan.jpeg",
  },
  {
    name: "Dr. K. R. Mulla",
    role: "Librarian, MSRIT, Bengaluru",
    photo: "/lisa-trustees/kr-mulla.jpg",
    imagePosition: "center 38%",
  },
  {
    name: "Dr. Manjunatha S",
    role: "Librarian, Government First Grade College, Malleswaram, Bangalore",
    photo: "/lisa-trustees/manjunatha-s.jpg",
  },
  {
    name: "Mr. Venkataraju R. S.",
    role: "Former Assistant Director, Prasaranga, VTU Belagavi; Former Asst Librarian, Dept of Public Libraries, Bangalore",
    photo: "/lisa-trustees/venkataraju-rs.jpg",
  },
  {
    name: "Dr. R. S. Wodeyar",
    role: "Deputy Librarian, Central University, Rajasthan",
    photo: "/lisa-trustees/rs-wodeyar.png",
  },
  {
    name: "Dr. Basavaraj S Kumbar",
    role: "Librarian, Gogte Institute of Technology, Belagavi",
    photo: "/lisa-trustees/basavaraj-kumbar.jpg",
  },
  {
    name: "Dr. Shivaram B. S.",
    role: "Head - ICAST, CSIR-National Aerospace Laboratories, Bengaluru",
    photo: "/lisa-trustees/shivaram-bs.jpg",
  },
  {
    name: "Dr. P. Y. Rajendra Kumar",
    role: "Former Director General, National Library of India, Kolkata",
    photo: "/lisa-trustees/py-rajendra-kumar.jpg",
  },
];

export const invitedTrustees: GovernanceMember[] = [
  {
    name: "Dr. G. Mahesh",
    role: "Chief Scientist, CSIR-Hq, New Delhi-67",
    photo: "/lisa-trustees/g-mahesh.png",
  },
  {
    name: "Dr. S. M. Pujar",
    role: "Chief Librarian, Indira Gandhi Institute for Development Research (IGIDR), Mumbai",
    photo: "/lisa-trustees/sm-pujar.jpg",
  },
  {
    name: "Dr. Satish Munnolli",
    role: "Chief Librarian, Advanced Centre for Treatment, Research and Education in Cancer (ACTREC), Navi Mumbai",
    photo: "/lisa-trustees/satish-munnolli.jpg",
  },
];

export const advisoryBoard: GovernanceMember[] = [
  {
    name: "Dr. Mahendra Jadhav",
    role: "Former-Librarian, IIT Madras, Chennai",
    photo: "/lisa-trustees/mahendra-jadhav.jpeg",
  },
  {
    name: "Dr. Bhojaraju Gunjal",
    role: "Head, Central Library, NIT Rourkela, Odisha",
    photo: "/lisa-trustees/bhojaraju-gunjal.jpeg",
  },
  {
    name: "Dr. S. L. Sangam",
    role: "Former Chairman, Dept of Library & Information Science, Karnatak University, Dharwad",
    photo: "/lisa-trustees/sl-sangam.png",
  },
  {
    name: "Dr. M. G. Sreekumar",
    role: "Vice President & Director, Libraries at Jio Institute, Navi Mumbai, Maharashtra",
    photo: "/lisa-trustees/mg-sreekumar.jpg",
  },
  {
    name: "Dr. Sathish Kumar Hosamani",
    role: "Former-Director, Department of Public Libraries, Bangalore",
    photo: "/lisa-trustees/sathish-kumar-hosamani.png",
  },
  {
    name: "Dr. Suresh Jange",
    role: "University Librarian, Gulbarga University, Kalaburagi",
    photo: "/lisa-trustees/suresh-jange.png",
  },
  {
    name: "Dr. Bibhuti Bhusan Sahoo",
    role: "Deputy Librarian, IIT Bhubaneswar, Odisha",
    photo: "/lisa-trustees/bibhuti-sahoo.jpg",
  },
  {
    name: "Dr. Vasnth Kumar",
    role: "Chief Librarian, AdiChunchanagiri University, Mandya",
    photo: "/lisa-trustees/vasanthkumar.png",
  }
];

export const governanceTabs: GovernanceTab[] = [
  { id: "founder", label: "Founder Trustees", data: founderTrustees },
  { id: "invited", label: "Invited Trustees", data: invitedTrustees },
  { id: "advisory", label: "Advisory Board", data: advisoryBoard },
];
