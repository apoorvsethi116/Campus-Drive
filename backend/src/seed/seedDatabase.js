/**
 * Seed script for local development only.
 *
 * WARNING: This script DROPS and recreates the User, StudentProfile,
 * PlacementDrive, and Application collections in the database pointed to
 * by MONGO_URI before inserting demo data. Do not point MONGO_URI at a
 * database you care about when running this script.
 *
 * Run with: npm run seed  (from the backend/ directory)
 */

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.model.js";
import { StudentProfile } from "../models/StudentProfile.model.js";
import { PlacementDrive } from "../models/PlacementDrive.model.js";
import { Application } from "../models/Application.model.js";

const DEMO_PASSWORD = "Demo@1234";
const SALT_ROUNDS = 10;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function clearCollections() {
  console.log("[seed] Clearing existing collections: User, StudentProfile, PlacementDrive, Application...");
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    PlacementDrive.deleteMany({}),
    Application.deleteMany({}),
  ]);
}

async function seedUsers() {
  const hashed = await hashPassword(DEMO_PASSWORD);

  const tpo = await User.create({
    name: "Anita Deshmukh",
    email: "tpo@campusdrive.test",
    password: hashed,
    role: "TPO",
  });

  const recruiter1 = await User.create({
    name: "Rahul Mehta",
    email: "recruiter1@campusdrive.test",
    password: hashed,
    role: "RECRUITER",
  });

  const recruiter2 = await User.create({
    name: "Priya Nair",
    email: "recruiter2@campusdrive.test",
    password: hashed,
    role: "RECRUITER",
  });

  // Student user accounts. Designed to cover distinct eligibility scenarios
  // once profiles are attached below.
  const studentSeeds = [
    { name: "Aarav Sharma", email: "aarav.student@campusdrive.test" },      // clearly eligible
    { name: "Ishita Verma", email: "ishita.student@campusdrive.test" },     // CGPA-ineligible
    { name: "Karan Patel", email: "karan.student@campusdrive.test" },       // backlog-ineligible
    { name: "Meera Iyer", email: "meera.student@campusdrive.test" },        // branch-ineligible
    { name: "Rohan Gupta", email: "rohan.student@campusdrive.test" },       // fails multiple criteria
    { name: "Sneha Reddy", email: "sneha.student@campusdrive.test" },       // clearly eligible, different branch
    { name: "Vikram Singh", email: "vikram.student@campusdrive.test" },     // borderline eligible (exact minimums)
    { name: "Ananya Joshi", email: "ananya.student@campusdrive.test" },     // clearly eligible
  ];

  const students = [];
  for (const s of studentSeeds) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      password: hashed,
      role: "STUDENT",
    });
    students.push(user);
  }

  return { tpo, recruiter1, recruiter2, students };
}

async function seedStudentProfiles(students) {
  const [aarav, ishita, karan, meera, rohan, sneha, vikram, ananya] = students;

  const profileData = [
    {
      user: aarav._id,
      collegeId: "CS2021001",
      phone: "9876543210",
      branch: "Computer Science",
      currentCGPA: 8.7,
      activeBacklogs: 0,
      tenthPercentage: 91,
      twelfthPercentage: 88,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/aarav-sharma.pdf",
      skills: ["JavaScript", "React", "Node.js"],
      profileCompleted: true,
    },
    {
      user: ishita._id,
      collegeId: "CS2021002",
      phone: "9876543211",
      branch: "Computer Science",
      currentCGPA: 6.2, // below typical minCGPA of 7+
      activeBacklogs: 0,
      tenthPercentage: 85,
      twelfthPercentage: 80,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/ishita-verma.pdf",
      skills: ["Python", "SQL"],
      profileCompleted: true,
    },
    {
      user: karan._id,
      collegeId: "ME2021015",
      phone: "9876543212",
      branch: "Mechanical Engineering",
      currentCGPA: 8.0,
      activeBacklogs: 3, // exceeds typical maxBacklogs of 1-2
      tenthPercentage: 82,
      twelfthPercentage: 79,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/karan-patel.pdf",
      skills: ["AutoCAD", "SolidWorks"],
      profileCompleted: true,
    },
    {
      user: meera._id,
      collegeId: "CE2021009",
      phone: "9876543213",
      branch: "Civil Engineering", // will not be in allowedBranches for tech drives
      currentCGPA: 8.9,
      activeBacklogs: 0,
      tenthPercentage: 93,
      twelfthPercentage: 90,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/meera-iyer.pdf",
      skills: ["Structural Analysis"],
      profileCompleted: true,
    },
    {
      user: rohan._id,
      collegeId: "IT2021022",
      phone: "9876543214",
      branch: "Electronics", // fails branch AND cgpa AND backlogs simultaneously
      currentCGPA: 5.8,
      activeBacklogs: 4,
      tenthPercentage: 70,
      twelfthPercentage: 68,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/rohan-gupta.pdf",
      skills: ["Circuit Design"],
      profileCompleted: true,
    },
    {
      user: sneha._id,
      collegeId: "IT2021005",
      phone: "9876543215",
      branch: "Information Technology",
      currentCGPA: 9.1,
      activeBacklogs: 0,
      tenthPercentage: 95,
      twelfthPercentage: 92,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/sneha-reddy.pdf",
      skills: ["Java", "Spring Boot", "AWS basics"],
      profileCompleted: true,
    },
    {
      user: vikram._id,
      collegeId: "CS2021030",
      phone: "9876543216",
      branch: "Computer Science",
      currentCGPA: 7.5, // designed to exactly equal a drive's minCGPA
      activeBacklogs: 1,
      tenthPercentage: 80,
      twelfthPercentage: 75,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/vikram-singh.pdf",
      skills: ["C++", "DSA"],
      profileCompleted: true,
    },
    {
      user: ananya._id,
      collegeId: "EC2021011",
      phone: "9876543217",
      branch: "Electronics and Communication",
      currentCGPA: 8.3,
      activeBacklogs: 0,
      tenthPercentage: 88,
      twelfthPercentage: 85,
      graduationYear: 2026,
      resumeUrl: "https://example.com/resumes/ananya-joshi.pdf",
      skills: ["Embedded C", "IoT"],
      profileCompleted: true,
    },
  ];

  const profiles = await StudentProfile.insertMany(profileData);
  return profiles;
}

async function seedDrives(tpo, recruiter1, recruiter2) {
  const now = Date.now();
  const daysFromNow = (n) => new Date(now + n * 24 * 60 * 60 * 1000);
  const daysAgo = (n) => new Date(now - n * 24 * 60 * 60 * 1000);

  const drives = await PlacementDrive.insertMany([
    {
      companyName: "TechNova Solutions",
      jobRole: "Software Engineer",
      description:
        "Full-stack development role working on TechNova's core SaaS platform. Involves React on the frontend and Node.js services on the backend.",
      location: "Bengaluru",
      employmentType: "FULL_TIME",
      ctc: 12,
      eligibilityCriteria: {
        minCGPA: 7.5,
        maxBacklogs: 1,
        allowedBranches: ["Computer Science", "Information Technology"],
        minTenthPercentage: 70,
        minTwelfthPercentage: 70,
      },
      deadline: daysFromNow(10),
      driveDate: daysFromNow(17),
      postedBy: tpo._id,
      recruiters: [recruiter1._id],
      status: "OPEN",
    },
    {
      companyName: "FinEdge Analytics",
      jobRole: "Data Analyst",
      description:
        "Analyze financial datasets and build dashboards for FinEdge's risk management team.",
      location: "Pune",
      employmentType: "FULL_TIME",
      ctc: 9,
      eligibilityCriteria: {
        minCGPA: 7.0,
        maxBacklogs: 0,
        allowedBranches: ["Computer Science", "Information Technology", "Electronics and Communication"],
        minTenthPercentage: 75,
        minTwelfthPercentage: 75,
      },
      deadline: daysFromNow(5),
      driveDate: daysFromNow(12),
      postedBy: tpo._id,
      recruiters: [recruiter2._id],
      status: "OPEN",
    },
    {
      companyName: "OrbitalWorks Aerospace",
      jobRole: "Mechanical Design Intern",
      description:
        "Internship supporting the structural design team on satellite component fabrication.",
      location: "Hyderabad",
      employmentType: "INTERNSHIP",
      ctc: 4,
      eligibilityCriteria: {
        minCGPA: 7.5,
        maxBacklogs: 0,
        allowedBranches: ["Mechanical Engineering"],
        minTenthPercentage: 70,
        minTwelfthPercentage: 70,
      },
      deadline: daysFromNow(15),
      driveDate: daysFromNow(25),
      postedBy: tpo._id,
      recruiters: [recruiter1._id],
      status: "OPEN",
      // Intentionally strict: the only Mechanical student (Karan, 3 backlogs) fails maxBacklogs: 0.
      // This drive demonstrates the "drive with no eligible students" test case.
    },
    {
      companyName: "Quantix Systems",
      jobRole: "Backend Engineer",
      description:
        "Build and scale distributed backend services for Quantix's enterprise clients.",
      location: "Remote",
      employmentType: "FULL_TIME",
      ctc: 15,
      eligibilityCriteria: {
        minCGPA: 8.5,
        maxBacklogs: 0,
        allowedBranches: ["Computer Science", "Information Technology"],
        minTenthPercentage: 80,
        minTwelfthPercentage: 80,
      },
      deadline: daysAgo(2), // already past deadline, status still OPEN to demo the deadline check
      driveDate: daysFromNow(30),
      postedBy: tpo._id,
      recruiters: [recruiter2._id],
      status: "OPEN",
    },
    {
      companyName: "Verdant Infra",
      jobRole: "Site Engineer",
      description:
        "On-site civil engineering role supporting Verdant's commercial construction projects.",
      location: "Mumbai",
      employmentType: "FULL_TIME",
      ctc: 7,
      eligibilityCriteria: {
        minCGPA: 7.0,
        maxBacklogs: 1,
        allowedBranches: ["Civil Engineering"],
        minTenthPercentage: 65,
        minTwelfthPercentage: 65,
      },
      deadline: daysFromNow(20),
      driveDate: daysFromNow(28),
      postedBy: tpo._id,
      recruiters: [recruiter1._id, recruiter2._id],
      status: "OPEN",
    },
  ]);

  return drives;
}

async function seedApplications(profiles, drives) {
  const [aarav, ishita, karan, meera, rohan, sneha, vikram, ananya] = profiles;
  const [techNova, finEdge] = drives;

  // Only clearly-eligible or borderline-eligible students are given
  // applications, since the real apply flow (built in Phase 3) will enforce
  // eligibility server-side. These rows simulate applications already in
  // various stages of the workflow.
  await Application.insertMany([
    {
      student: aarav._id,
      drive: techNova._id,
      status: "INTERVIEW",
      recruiterNotes: "Strong DSA round. Scheduled for technical interview.",
    },
    {
      student: vikram._id,
      drive: techNova._id,
      status: "SHORTLISTED",
      recruiterNotes: "Meets minimum CGPA exactly. Cleared resume screening.",
    },
    {
      student: sneha._id,
      drive: finEdge._id,
      status: "OFFERED",
      recruiterNotes: "Excellent performance across all rounds. Offer extended.",
    },
    {
      student: ananya._id,
      drive: finEdge._id,
      status: "APPLIED",
      recruiterNotes: "",
    },
  ]);
}

function printCredentials() {
  const line = "-".repeat(60);
  console.log(`\n${line}`);
  console.log("CampusDrive AI — Demo Login Credentials");
  console.log(line);
  console.log(`All demo accounts share the password: ${DEMO_PASSWORD}\n`);
  console.log("TPO:");
  console.log("  email: tpo@campusdrive.test\n");
  console.log("Recruiters:");
  console.log("  email: recruiter1@campusdrive.test");
  console.log("  email: recruiter2@campusdrive.test\n");
  console.log("Students (sample):");
  console.log("  email: aarav.student@campusdrive.test   (clearly eligible for TechNova)");
  console.log("  email: ishita.student@campusdrive.test  (CGPA below requirement)");
  console.log("  email: karan.student@campusdrive.test   (too many backlogs)");
  console.log("  email: meera.student@campusdrive.test   (branch not eligible for tech drives)");
  console.log("  email: rohan.student@campusdrive.test   (fails multiple criteria)");
  console.log("  email: vikram.student@campusdrive.test  (borderline: exact minimum CGPA)");
  console.log(line + "\n");
}

async function seed() {
  try {
    await connectDB();
    await clearCollections();

    const { tpo, recruiter1, recruiter2, students } = await seedUsers();
    const profiles = await seedStudentProfiles(students);
    const drives = await seedDrives(tpo, recruiter1, recruiter2);
    await seedApplications(profiles, drives);

    console.log(
      `[seed] Done. Created ${students.length + 3} users, ${profiles.length} student profiles, ${drives.length} drives, and 4 applications.`
    );
    printCredentials();
  } catch (error) {
    console.error("[seed] Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

seed();