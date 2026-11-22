/**
 * CareerNest – Sample Data Seeder
 * ================================
 * Inserts sample recruiter users, companies, jobs, student users, and applications
 * directly into MongoDB so the app has realistic demo data.
 *
 * Usage:
 *   1. Make sure your .env file has a valid MONGO_URI
 *   2. Run:  node seedData.js
 *   3. To clear existing seed data first:  node seedData.js --fresh
 *
 * Default recruiter login → email: recruiter@google.com  password: Test@1234
 * Default student  login → email: rahul@example.com      password: Test@1234
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { Application } from "./models/application.model.js";

dotenv.config();

// ─── Configuration ───────────────────────────────────────────
const COMMON_PASSWORD = await bcrypt.hash("Test@1234", 10);

// ─── Recruiter Users ────────────────────────────────────────
const recruiters = [
  {
    fullname: "Sundar Pichai",
    email: "recruiter@google.com",
    phoneNumber: 9876543210,
    password: COMMON_PASSWORD,
    role: "recruiter",
    profile: {
      bio: "HR Lead at Google India",
      skills: [],
      profilePhoto: "",
    },
  },
  {
    fullname: "Satya Nadella",
    email: "recruiter@microsoft.com",
    phoneNumber: 9876543211,
    password: COMMON_PASSWORD,
    role: "recruiter",
    profile: {
      bio: "Talent Acquisition at Microsoft",
      skills: [],
      profilePhoto: "",
    },
  },
  {
    fullname: "Parag Agrawal",
    email: "recruiter@amazon.com",
    phoneNumber: 9876543212,
    password: COMMON_PASSWORD,
    role: "recruiter",
    profile: {
      bio: "Senior Recruiter at Amazon",
      skills: [],
      profilePhoto: "",
    },
  },
  {
    fullname: "Kalyan Krishnamurthy",
    email: "recruiter@flipkart.com",
    phoneNumber: 9876543213,
    password: COMMON_PASSWORD,
    role: "recruiter",
    profile: {
      bio: "Head of Talent Acquisition at Flipkart",
      skills: [],
      profilePhoto: "",
    },
  },
  {
    fullname: "Salil Parekh",
    email: "recruiter@infosys.com",
    phoneNumber: 9876543214,
    password: COMMON_PASSWORD,
    role: "recruiter",
    profile: {
      bio: "Talent Lead at Infosys",
      skills: [],
      profilePhoto: "",
    },
  },
  {
    fullname: "Harshil Mathur",
    email: "recruiter@razorpay.com",
    phoneNumber: 9876543215,
    password: COMMON_PASSWORD,
    role: "recruiter",
    profile: {
      bio: "People Ops at Razorpay",
      skills: [],
      profilePhoto: "",
    },
  },
];

// ─── Companies ──────────────────────────────────────────────
const companiesData = [
  {
    name: "Google",
    description:
      "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, and artificial intelligence.",
    website: "https://careers.google.com",
    location: "Bangalore, India",
    industry: "Technology",
    companySize: "10000+",
    founded: 1998,
    companyType: "Public",
    specializations: ["Search", "Cloud Computing", "AI/ML", "Android", "Ads"],
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path fill='%23EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/><path fill='%234285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/><path fill='%23FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'/><path fill='%2334A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/></svg>",
    _recruiterEmail: "recruiter@google.com",
  },
  {
    name: "Microsoft",
    description:
      "Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and related services.",
    website: "https://careers.microsoft.com",
    location: "Hyderabad, India",
    industry: "Technology",
    companySize: "10000+",
    founded: 1975,
    companyType: "Public",
    specializations: ["Cloud (Azure)", "Office 365", "Windows", "AI", "Gaming"],
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='1' y='1' width='10' height='10' fill='%23F25022'/><rect x='13' y='1' width='10' height='10' fill='%237FBA00'/><rect x='1' y='13' width='10' height='10' fill='%2300A4EF'/><rect x='13' y='13' width='10' height='10' fill='%23FFB900'/></svg>",
    _recruiterEmail: "recruiter@microsoft.com",
  },
  {
    name: "Amazon",
    description:
      "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing (AWS), online advertising, digital streaming, and artificial intelligence.",
    website: "https://www.amazon.jobs",
    location: "Gurugram, India",
    industry: "E-commerce / Technology",
    companySize: "10000+",
    founded: 1994,
    companyType: "Public",
    specializations: ["AWS", "E-commerce", "Alexa", "Prime Video", "Logistics"],
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='10' fill='%23232F3E'/><path d='M14 26c3 3 11 6 20 1-4 3-13 5-20-1z' fill='%23FF9900'/><path d='M32 25c1 1.5 2.5 2 4 2-1-1-1.5-2.5-1.5-4 0 0-.5 1-2.5 2z' fill='%23FF9900'/><text x='14' y='22' font-family='Arial, sans-serif' font-weight='900' font-size='16' fill='white'>amazon</text></svg>",
    _recruiterEmail: "recruiter@amazon.com",
  },
  {
    name: "Flipkart",
    description:
      "Flipkart is an Indian e-commerce company headquartered in Bangalore. It is one of the largest online retailers in India.",
    website: "https://www.flipkartcareers.com",
    location: "Bangalore, India",
    industry: "E-commerce",
    companySize: "5001-10000",
    founded: 2007,
    companyType: "Private",
    specializations: ["E-commerce", "Supply Chain", "Fintech", "Ads Platform"],
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='10' fill='%232874F0'/><path d='M15 11h11a6 6 0 0 1 6 6v1h-5v-1a2 2 0 0 0-2-2H15v20h-4V11h4z' fill='%23FFE500'/><path d='M15 20h12v4H15v-4z' fill='%23FFE500'/></svg>",
    _recruiterEmail: "recruiter@flipkart.com",
  },
  {
    name: "Infosys",
    description:
      "Infosys Limited is an Indian multinational information technology company providing business consulting, information technology, and outsourcing services.",
    website: "https://www.infosys.com/careers",
    location: "Pune, India",
    industry: "IT Services & Consulting",
    companySize: "10000+",
    founded: 1981,
    companyType: "Public",
    specializations: ["IT Consulting", "Digital Transformation", "Cloud", "SAP", "Data Analytics"],
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='10' fill='%23007CC3'/><text x='24' y='29' font-family='Arial, sans-serif' font-weight='bold' font-size='13' text-anchor='middle' fill='white'>infosys</text></svg>",
    _recruiterEmail: "recruiter@infosys.com",
  },
  {
    name: "Razorpay",
    description:
      "Razorpay is an Indian fintech company that provides online payment solutions to businesses. It offers a suite of products including payment gateway, payroll, and business banking.",
    website: "https://razorpay.com/jobs",
    location: "Bangalore, India",
    industry: "Fintech",
    companySize: "1001-5000",
    founded: 2014,
    companyType: "Private",
    specializations: ["Payments", "Fintech", "Banking", "APIs"],
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' rx='10' fill='%230C2340'/><path d='M18 34l7-18h6l-4.5 11h6.5l-11 13 2-6h-6z' fill='%2300BAF2'/></svg>",
    _recruiterEmail: "recruiter@razorpay.com",
  },
];

// ─── Jobs ───────────────────────────────────────────────────
const jobsData = [
  // Google jobs
  {
    title: "Frontend Developer",
    description:
      "Build responsive and scalable user interfaces for Google products using React, TypeScript and modern web standards. Collaborate with UX designers and backend engineers.",
    requirements: ["React", "TypeScript", "HTML/CSS", "JavaScript", "Git"],
    salary: "12-18",
    experienceLevel: "1-3",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "Hybrid",
    benefits: ["Health Insurance", "Free Meals", "Gym", "Stock Options"],
    applicationDeadline: new Date("2027-03-31"),
    position: 5,
    _companyName: "Google",
  },
  {
    title: "Backend Developer",
    description:
      "Design and implement RESTful APIs and microservices for Google Cloud Platform. Work with distributed systems at massive scale.",
    requirements: ["Node.js", "Python", "MongoDB", "REST APIs", "Docker", "Kubernetes"],
    salary: "15-25",
    experienceLevel: "2-5",
    location: "Hyderabad, India",
    jobType: "Full-Time",
    workMode: "On-site",
    benefits: ["Health Insurance", "Relocation Bonus", "Stock Options"],
    applicationDeadline: new Date("2027-04-15"),
    position: 3,
    _companyName: "Google",
  },
  {
    title: "Data Scientist",
    description:
      "Analyze large datasets to drive product decisions. Build ML models for search ranking, ad relevance, and content recommendation.",
    requirements: ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistics"],
    salary: "18-30",
    experienceLevel: "3-6",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "Remote",
    benefits: ["Health Insurance", "Learning Budget", "Stock Options", "Flexible Hours"],
    applicationDeadline: new Date("2027-02-28"),
    position: 2,
    _companyName: "Google",
  },

  // Microsoft jobs
  {
    title: "Full Stack Developer",
    description:
      "Develop end-to-end features for Microsoft Teams. Build both the React frontend and the .NET backend services powering collaboration experiences.",
    requirements: ["React", "C#", ".NET", "Azure", "SQL Server", "TypeScript"],
    salary: "14-22",
    experienceLevel: "2-4",
    location: "Hyderabad, India",
    jobType: "Full-Time",
    workMode: "Hybrid",
    benefits: ["Health Insurance", "Annual Bonus", "Stock Options", "Education Assistance"],
    applicationDeadline: new Date("2027-05-01"),
    position: 4,
    _companyName: "Microsoft",
  },
  {
    title: "Cloud Solutions Architect",
    description:
      "Help enterprise customers design and implement cloud solutions on Microsoft Azure. Lead technical discussions, architecture workshops, and proof-of-concept projects.",
    requirements: ["Azure", "Cloud Architecture", "Networking", "Security", "Terraform"],
    salary: "25-40",
    experienceLevel: "5-10",
    location: "Mumbai, India",
    jobType: "Full-Time",
    workMode: "Hybrid",
    benefits: ["Health Insurance", "Company Car", "Stock Options", "Travel Allowance"],
    applicationDeadline: new Date("2027-04-30"),
    position: 2,
    _companyName: "Microsoft",
  },
  {
    title: "DevOps Engineer",
    description:
      "Automate CI/CD pipelines, manage infrastructure as code, and ensure high availability of services on Azure. Collaborate with development teams to improve deployment velocity.",
    requirements: ["Azure DevOps", "Docker", "Kubernetes", "Terraform", "Linux", "Python"],
    salary: "12-20",
    experienceLevel: "2-5",
    location: "Noida, India",
    jobType: "Full-Time",
    workMode: "On-site",
    benefits: ["Health Insurance", "Annual Bonus", "Free Certifications"],
    applicationDeadline: new Date("2027-03-15"),
    position: 3,
    _companyName: "Microsoft",
  },

  // Amazon jobs
  {
    title: "SDE-1 (Software Development Engineer)",
    description:
      "Design and build scalable, high-performance services for Amazon's e-commerce platform. Work on order management, search, or recommendations.",
    requirements: ["Java", "Data Structures", "Algorithms", "AWS", "System Design"],
    salary: "10-16",
    experienceLevel: "0-2",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "On-site",
    benefits: ["Health Insurance", "Relocation", "Sign-on Bonus", "RSUs"],
    applicationDeadline: new Date("2027-06-30"),
    position: 10,
    _companyName: "Amazon",
  },
  {
    title: "Product Manager",
    description:
      "Own the product vision and roadmap for Amazon Pay. Work closely with engineering, design, and business teams to deliver delightful payment experiences for millions of customers.",
    requirements: ["Product Management", "SQL", "Data Analysis", "Agile", "User Research"],
    salary: "20-35",
    experienceLevel: "4-8",
    location: "Gurugram, India",
    jobType: "Full-Time",
    workMode: "Hybrid",
    benefits: ["Health Insurance", "Stock Options", "Annual Bonus"],
    applicationDeadline: new Date("2027-04-01"),
    position: 2,
    _companyName: "Amazon",
  },

  // Flipkart jobs
  {
    title: "Mobile App Developer (React Native)",
    description:
      "Build and maintain Flipkart's customer-facing mobile app using React Native. Focus on performance, accessibility, and a smooth shopping experience.",
    requirements: ["React Native", "JavaScript", "Redux", "iOS", "Android"],
    salary: "10-18",
    experienceLevel: "1-4",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "Hybrid",
    benefits: ["Health Insurance", "Employee Discounts", "ESOPs"],
    applicationDeadline: new Date("2027-05-15"),
    position: 4,
    _companyName: "Flipkart",
  },
  {
    title: "UI/UX Designer",
    description:
      "Design intuitive and engaging user experiences for Flipkart's web and mobile platforms. Conduct user research, create wireframes, and collaborate with engineers.",
    requirements: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
    salary: "8-14",
    experienceLevel: "1-3",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "Remote",
    benefits: ["Health Insurance", "Learning Budget", "Flexible Hours"],
    applicationDeadline: new Date("2027-04-20"),
    position: 2,
    _companyName: "Flipkart",
  },

  // Infosys jobs
  {
    title: "Java Developer",
    description:
      "Develop enterprise Java applications for Infosys clients in BFSI and retail domains. Work with Spring Boot, microservices, and cloud deployments.",
    requirements: ["Java", "Spring Boot", "Microservices", "REST APIs", "SQL"],
    salary: "6-10",
    experienceLevel: "0-2",
    location: "Pune, India",
    jobType: "Full-Time",
    workMode: "On-site",
    benefits: ["Health Insurance", "NPS Contribution", "Training Programs"],
    applicationDeadline: new Date("2027-07-31"),
    position: 15,
    _companyName: "Infosys",
  },
  {
    title: "QA Engineer",
    description:
      "Ensure quality of enterprise applications through manual and automated testing. Build and maintain test suites using Selenium and JUnit.",
    requirements: ["Selenium", "JUnit", "API Testing", "JIRA", "SQL"],
    salary: "5-8",
    experienceLevel: "0-2",
    location: "Mysore, India",
    jobType: "Full-Time",
    workMode: "On-site",
    benefits: ["Health Insurance", "NPS Contribution"],
    applicationDeadline: new Date("2027-06-15"),
    position: 10,
    _companyName: "Infosys",
  },

  // Razorpay jobs
  {
    title: "Backend Engineer (Payments)",
    description:
      "Build and scale Razorpay's core payment infrastructure. Work on transaction processing, settlement systems, and payment gateway integrations.",
    requirements: ["Go", "Node.js", "PostgreSQL", "Redis", "Kafka", "REST APIs"],
    salary: "14-22",
    experienceLevel: "2-5",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "Hybrid",
    benefits: ["Health Insurance", "ESOPs", "Learning Budget", "Home Office Setup"],
    applicationDeadline: new Date("2027-04-10"),
    position: 3,
    _companyName: "Razorpay",
  },
  {
    title: "Frontend Engineer",
    description:
      "Build Razorpay's merchant dashboard, checkout experiences, and developer documentation portal using React, Next.js, and modern CSS.",
    requirements: ["React", "Next.js", "JavaScript", "CSS", "Git"],
    salary: "10-16",
    experienceLevel: "1-3",
    location: "Bangalore, India",
    jobType: "Full-Time",
    workMode: "Remote",
    benefits: ["Health Insurance", "ESOPs", "Unlimited Sick Leave"],
    applicationDeadline: new Date("2027-05-20"),
    position: 2,
    _companyName: "Razorpay",
  },
];

// ─── Student Users ──────────────────────────────────────────
const students = [
  {
    fullname: "Rahul Sharma",
    email: "rahul@example.com",
    phoneNumber: 9988776601,
    password: COMMON_PASSWORD,
    role: "student",
    profile: {
      bio: "Final year B.Tech student passionate about full-stack web development.",
      skills: ["React", "Node.js", "JavaScript", "MongoDB", "Git", "CSS"],
      profilePhoto: "",
    },
  },
  {
    fullname: "Priya Patel",
    email: "priya@example.com",
    phoneNumber: 9988776602,
    password: COMMON_PASSWORD,
    role: "student",
    profile: {
      bio: "Data science enthusiast with hands-on experience in ML and Python.",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistics", "Pandas"],
      profilePhoto: "",
    },
  },
  {
    fullname: "Amit Kumar",
    email: "amit@example.com",
    phoneNumber: 9988776603,
    password: COMMON_PASSWORD,
    role: "student",
    profile: {
      bio: "Backend developer with strong Java and cloud skills.",
      skills: ["Java", "Spring Boot", "AWS", "Docker", "SQL", "Microservices"],
      profilePhoto: "",
    },
  },
  {
    fullname: "Sneha Reddy",
    email: "sneha@example.com",
    phoneNumber: 9988776604,
    password: COMMON_PASSWORD,
    role: "student",
    profile: {
      bio: "Creative UI/UX designer transitioning into frontend development.",
      skills: ["Figma", "React", "CSS", "JavaScript", "Wireframing", "User Research"],
      profilePhoto: "",
    },
  },
  {
    fullname: "Vikram Singh",
    email: "vikram@example.com",
    phoneNumber: 9988776605,
    password: COMMON_PASSWORD,
    role: "student",
    profile: {
      bio: "DevOps and cloud infrastructure enthusiast.",
      skills: ["Docker", "Kubernetes", "Terraform", "AWS", "Linux", "Python", "CI/CD"],
      profilePhoto: "",
    },
  },
];

// ═══════════════════════════════════════════════════════════
// SEED LOGIC
// ═══════════════════════════════════════════════════════════

const isFresh = process.argv.includes("--fresh");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // ── Optionally wipe existing data ──
    if (isFresh) {
      console.log("🗑️  --fresh flag detected → Clearing existing data...");
      await Application.deleteMany({});
      await Job.deleteMany({});
      await Company.deleteMany({});
      await User.deleteMany({});
      console.log("   Done.\n");
    }

    // ── 1. Create Recruiter Users ──
    console.log("👤 Creating recruiter users...");
    const recruiterMap = {}; // email → user doc
    for (const r of recruiters) {
      let user = await User.findOne({ email: r.email });
      if (!user) {
        user = await User.create(r);
        console.log(`   ✅ Created recruiter: ${r.fullname} (${r.email})`);
      } else {
        console.log(`   ⏭️  Recruiter already exists: ${r.email}`);
      }
      recruiterMap[r.email] = user;
    }

    // ── 2. Create Companies ──
    console.log("\n🏢 Creating companies...");
    const companyMap = {}; // name → company doc
    for (const c of companiesData) {
      let company = await Company.findOne({ name: c.name });
      if (!company) {
        const recruiter = recruiterMap[c._recruiterEmail];
        const { _recruiterEmail, ...companyFields } = c;
        company = await Company.create({
          ...companyFields,
          userId: recruiter._id,
        });
        console.log(`   ✅ Created company: ${c.name}`);
      } else {
        console.log(`   ⏭️  Company already exists: ${c.name}`);
      }
      companyMap[c.name] = company;
    }

    // ── 3. Create Jobs ──
    console.log("\n💼 Creating jobs...");
    const createdJobs = [];
    for (const j of jobsData) {
      const company = companyMap[j._companyName];
      const existing = await Job.findOne({
        title: j.title,
        company: company._id,
      });
      if (!existing) {
        const { _companyName, ...jobFields } = j;
        const job = await Job.create({
          ...jobFields,
          company: company._id,
          created_by: company.userId,
        });
        createdJobs.push(job);
        console.log(`   ✅ Created job: ${j.title} @ ${j._companyName}`);
      } else {
        createdJobs.push(existing);
        console.log(`   ⏭️  Job already exists: ${j.title} @ ${j._companyName}`);
      }
    }

    // ── 4. Create Student Users ──
    console.log("\n🎓 Creating student users...");
    const studentDocs = [];
    for (const s of students) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create(s);
        console.log(`   ✅ Created student: ${s.fullname} (${s.email})`);
      } else {
        console.log(`   ⏭️  Student already exists: ${s.email}`);
      }
      studentDocs.push(user);
    }

    // ── 5. Create Sample Applications ──
    console.log("\n📝 Creating sample applications...");
    const applicationPairs = [
      // Rahul applies to Google Frontend & Amazon SDE-1
      { studentIdx: 0, jobTitle: "Frontend Developer", companyName: "Google", status: "pending" },
      { studentIdx: 0, jobTitle: "SDE-1 (Software Development Engineer)", companyName: "Amazon", status: "accepted" },
      // Priya applies to Google Data Scientist
      { studentIdx: 1, jobTitle: "Data Scientist", companyName: "Google", status: "pending" },
      // Amit applies to Amazon SDE-1 & Infosys Java Developer
      { studentIdx: 2, jobTitle: "SDE-1 (Software Development Engineer)", companyName: "Amazon", status: "pending" },
      { studentIdx: 2, jobTitle: "Java Developer", companyName: "Infosys", status: "accepted" },
      // Sneha applies to Flipkart UI/UX Designer
      { studentIdx: 3, jobTitle: "UI/UX Designer", companyName: "Flipkart", status: "pending" },
      // Vikram applies to Microsoft DevOps & Razorpay Backend
      { studentIdx: 4, jobTitle: "DevOps Engineer", companyName: "Microsoft", status: "rejected" },
      { studentIdx: 4, jobTitle: "Backend Engineer (Payments)", companyName: "Razorpay", status: "pending" },
    ];

    for (const ap of applicationPairs) {
      const student = studentDocs[ap.studentIdx];
      const company = companyMap[ap.companyName];
      const job = createdJobs.find(
        (j) => j.title === ap.jobTitle && j.company.toString() === company._id.toString()
      );
      if (!job) {
        console.log(`   ⚠️  Job not found: ${ap.jobTitle} @ ${ap.companyName}`);
        continue;
      }
      const existingApp = await Application.findOne({
        job: job._id,
        applicant: student._id,
      });
      if (!existingApp) {
        const application = await Application.create({
          job: job._id,
          applicant: student._id,
          status: ap.status,
        });
        // Add application reference to the job
        job.applications.push(application._id);
        await job.save();
        console.log(
          `   ✅ ${student.fullname} applied to "${ap.jobTitle}" @ ${ap.companyName} [${ap.status}]`
        );
      } else {
        console.log(
          `   ⏭️  Application already exists: ${student.fullname} → ${ap.jobTitle}`
        );
      }
    }

    // ── Summary ──
    console.log("\n" + "═".repeat(60));
    console.log("🎉 SEED COMPLETE!");
    console.log("═".repeat(60));
    console.log(`   Recruiters : ${Object.keys(recruiterMap).length}`);
    console.log(`   Companies  : ${Object.keys(companyMap).length}`);
    console.log(`   Jobs       : ${createdJobs.length}`);
    console.log(`   Students   : ${studentDocs.length}`);
    console.log(`   Applications: ${applicationPairs.length}`);
    console.log("");
    console.log("📌 Login Credentials (password for all: Test@1234):");
    console.log("   ┌──────────────────────────────────┬──────────┐");
    console.log("   │ Email                            │ Role     │");
    console.log("   ├──────────────────────────────────┼──────────┤");
    console.log("   │ recruiter@google.com             │ recruiter│");
    console.log("   │ recruiter@microsoft.com          │ recruiter│");
    console.log("   │ recruiter@amazon.com             │ recruiter│");
    console.log("   │ rahul@example.com                │ student  │");
    console.log("   │ priya@example.com                │ student  │");
    console.log("   │ amit@example.com                 │ student  │");
    console.log("   │ sneha@example.com                │ student  │");
    console.log("   │ vikram@example.com               │ student  │");
    console.log("   └──────────────────────────────────┴──────────┘");
    console.log("");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();

