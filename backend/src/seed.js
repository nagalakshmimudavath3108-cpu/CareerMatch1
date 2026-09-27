require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const JobSeekerProfile = require('./models/JobSeekerProfile');
const RecruiterProfile = require('./models/RecruiterProfile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Interview = require('./models/Interview');
const { calculateJobMatch } = require('./services/matching');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careermatch';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await JobSeekerProfile.deleteMany({});
    await RecruiterProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Interview.deleteMany({});

    console.log('Cleaned old database collections.');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@careermatch.com',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    // 2. Create Recruiters
    const recruiter1 = await User.create({
      name: 'Sarah Connor',
      email: 'recruiter@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    const recruiter2 = await User.create({
      name: 'David Miller',
      email: 'recruiter@innovate.com',
      password: 'password123',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    // Recruiter Profiles
    const recruiterProfile1 = await RecruiterProfile.create({
      user: recruiter1._id,
      companyName: 'TechCorp Cloud Systems',
      companyWebsite: 'https://techcorp.example.com',
      companyBio: 'Leading enterprise cloud solution provider building the future of software infrastructure.',
      industry: 'Information Technology',
      companySize: '250-500 employees',
      location: 'San Francisco, CA (Remote)',
      phone: '+1 415 555 0199',
    });

    const recruiterProfile2 = await RecruiterProfile.create({
      user: recruiter2._id,
      companyName: 'InnovateLab AI',
      companyWebsite: 'https://innovatelab.example.com',
      companyBio: 'Cutting-edge AI research studio bringing agentic platforms to life.',
      industry: 'Artificial Intelligence',
      companySize: '50-100 employees',
      location: 'New York, NY',
      phone: '+1 212 555 0144',
    });

    // 3. Create Job Seekers
    const seeker1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'password123',
      role: 'jobseeker',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    });

    const seeker2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@example.com',
      password: 'password123',
      role: 'jobseeker',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    // Job Seeker Profiles
    const seekerProfile1 = await JobSeekerProfile.create({
      user: seeker1._id,
      headline: 'Senior Full Stack Engineer (React / Node.js / MongoDB)',
      bio: 'Passionate developer with 4 years of experience building modern web apps, real-time engines, and scalable microservices.',
      location: 'Austin, TX',
      phone: '+1 512 555 0123',
      website: 'https://alexrivera.dev',
      github: 'https://github.com/alexrivera',
      linkedin: 'https://linkedin.com/in/alexrivera',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Socket.IO', 'Git', 'Express'],
      experienceYears: 4,
      education: [
        {
          institution: 'University of Texas at Austin',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: '2018',
          endYear: '2022',
          grade: '3.8 GPA',
        },
      ],
      experience: [
        {
          company: 'CloudWave Inc',
          role: 'Full Stack Developer',
          location: 'Austin, TX',
          startDate: '2022',
          endDate: 'Present',
          isCurrent: true,
          description: 'Developed scalable React components and Node.js microservices serving 100k+ active users.',
        },
      ],
      projects: [
        {
          title: 'DevHub Collaborative Canvas',
          description: 'Real-time collaborative diagramming platform using WebSockets and React canvas.',
          technologies: ['React', 'Node.js', 'Socket.IO'],
          githubLink: 'https://github.com/alexrivera/devhub',
        },
      ],
    });

    const seekerProfile2 = await JobSeekerProfile.create({
      user: seeker2._id,
      headline: 'Frontend React & UI Architect',
      bio: 'Crafting pixel-perfect, interactive user interfaces with React, CSS Animations, and Next.js.',
      location: 'San Jose, CA',
      phone: '+1 408 555 0888',
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Git', 'Figma'],
      experienceYears: 2,
      education: [
        {
          institution: 'San Jose State University',
          degree: 'B.S.',
          fieldOfStudy: 'Software Engineering',
          startYear: '2019',
          endYear: '2023',
        },
      ],
      experience: [
        {
          company: 'PixelCraft Agency',
          role: 'Frontend Developer',
          startDate: '2023',
          endDate: 'Present',
          isCurrent: true,
          description: 'Built responsive web platforms and design systems for enterprise SaaS clients.',
        },
      ],
    });

    // 4. Create Jobs
    const job1 = await Job.create({
      recruiter: recruiter1._id,
      companyProfile: recruiterProfile1._id,
      companyName: recruiterProfile1.companyName,
      companyLogo: recruiterProfile1.companyLogo,
      title: 'Senior Full Stack React & Node.js Developer',
      description: `We are looking for an exceptional Full Stack Engineer to join TechCorp Cloud Systems. 
In this role, you will lead the architecture of our real-time portal, build interactive dashboards, and design high-performance MongoDB/Express backend APIs.

Responsibilities:
- Build clean, scalable React UI components
- Architect real-time socket services and RESTful APIs
- Collaborate with product designers and backend engineers
- Maintain high security standards and test coverage`,
      department: 'Engineering',
      location: 'San Francisco, CA (Remote)',
      type: 'full-time',
      experienceLevel: 'Senior Level',
      salaryMin: 120000,
      salaryMax: 160000,
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Git', 'Express'],
      niceToHaveSkills: ['TypeScript', 'Socket.IO', 'Docker'],
      status: 'open',
      applicantsCount: 2,
    });

    const job2 = await Job.create({
      recruiter: recruiter1._id,
      companyProfile: recruiterProfile1._id,
      companyName: recruiterProfile1.companyName,
      title: 'Frontend React UI Specialist',
      description: 'TechCorp is looking for a UI Engineer with deep expertise in React, Tailwind CSS, and UI component design systems.',
      department: 'Frontend Engineering',
      location: 'Remote',
      type: 'full-time',
      experienceLevel: 'Mid Level',
      salaryMin: 90000,
      salaryMax: 125000,
      requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'],
      niceToHaveSkills: ['Redux', 'TypeScript', 'Figma'],
      status: 'open',
      applicantsCount: 1,
    });

    const job3 = await Job.create({
      recruiter: recruiter2._id,
      companyProfile: recruiterProfile2._id,
      companyName: recruiterProfile2.companyName,
      title: 'AI Platform Backend Engineer',
      description: 'InnovateLab AI seeks a talented Node.js engineer to build real-time agent orchestration backends.',
      department: 'Backend Engineering',
      location: 'New York, NY',
      type: 'full-time',
      experienceLevel: 'Senior Level',
      salaryMin: 130000,
      salaryMax: 175000,
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Python'],
      niceToHaveSkills: ['GraphQL', 'Kubernetes'],
      status: 'open',
      applicantsCount: 0,
    });

    // 5. Create Applications
    const match1 = calculateJobMatch(seekerProfile1.skills, job1.requiredSkills, job1.niceToHaveSkills);
    const app1 = await Application.create({
      job: job1._id,
      jobSeeker: seeker1._id,
      recruiter: recruiter1._id,
      status: 'shortlisted',
      coverLetter: 'I have 4 years of experience with React, Node, and MongoDB. I built several real-time systems using Socket.IO and would love to contribute to TechCorp!',
      matchPercentage: match1.matchPercentage,
      matchingSkills: match1.matchingSkills,
      missingSkills: match1.missingSkills,
      timeline: [
        { status: 'applied', note: 'Application submitted', updatedAt: new Date(Date.now() - 86400000 * 3) },
        { status: 'shortlisted', note: 'Candidate profile fits position requirements', updatedAt: new Date(Date.now() - 86400000 * 1) },
      ],
    });

    const match2 = calculateJobMatch(seekerProfile2.skills, job1.requiredSkills, job1.niceToHaveSkills);
    const app2 = await Application.create({
      job: job1._id,
      jobSeeker: seeker2._id,
      recruiter: recruiter1._id,
      status: 'applied',
      coverLetter: 'Experienced React developer passionate about creating modern user interface experiences.',
      matchPercentage: match2.matchPercentage,
      matchingSkills: match2.matchingSkills,
      missingSkills: match2.missingSkills,
      timeline: [{ status: 'applied', note: 'Application submitted', updatedAt: new Date(Date.now() - 86400000 * 2) }],
    });

    // 6. Create Conversations & Messages
    const conv1 = await Conversation.create({
      participants: [seeker1._id, recruiter1._id],
      application: app1._id,
      job: job1._id,
      lastMessage: 'Looking forward to our scheduled interview on Monday!',
      lastMessageSender: seeker1._id,
      lastMessageAt: new Date(),
    });

    await Message.create({
      conversation: conv1._id,
      sender: recruiter1._id,
      recipient: seeker1._id,
      text: 'Hi Alex! Your profile and 100% skill match score are impressive. We would like to schedule a technical interview.',
      createdAt: new Date(Date.now() - 3600000 * 5),
    });

    await Message.create({
      conversation: conv1._id,
      sender: seeker1._id,
      recipient: recruiter1._id,
      text: 'Thank you Sarah! I would be thrilled to talk. Looking forward to our scheduled interview on Monday!',
      createdAt: new Date(Date.now() - 3600000 * 2),
    });

    // 7. Create Scheduled Interview
    await Interview.create({
      application: app1._id,
      job: job1._id,
      candidate: seeker1._id,
      recruiter: recruiter1._id,
      title: 'Technical Deep-Dive & Architecture Interview',
      description: 'Discuss React state management, MongoDB indexing, and real-time Socket.IO scalability.',
      scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/careermatch-techcorp-alex',
      location: 'Google Meet Video Call',
      status: 'scheduled',
      notes: 'Candidate has strong background in Node.js microservices.',
    });

    // 8. Create Notifications
    await Notification.create({
      recipient: seeker1._id,
      sender: recruiter1._id,
      type: 'status_changed',
      title: '🌟 Application Shortlisted!',
      message: 'Good news! Your application for "Senior Full Stack React & Node.js Developer" at TechCorp Cloud Systems has been shortlisted.',
      link: '/jobseeker/applications',
    });

    await Notification.create({
      recipient: seeker1._id,
      sender: recruiter1._id,
      type: 'interview_scheduled',
      title: '📅 Interview Invitation!',
      message: 'You have an interview scheduled for "Senior Full Stack React & Node.js Developer".',
      link: '/jobseeker/interviews',
    });

    await Notification.create({
      recipient: recruiter1._id,
      sender: seeker1._id,
      type: 'application_received',
      title: 'New Applicant Received!',
      message: 'Alex Rivera applied for "Senior Full Stack React & Node.js Developer" with a 100% match score.',
      link: '/recruiter/applicants',
    });

    console.log('✅ Demo seed data created successfully!');
    console.log('\n--- DEMO LOGIN CREDENTIALS ---');
    console.log('1. Admin:       admin@careermatch.com / password123');
    console.log('2. Recruiter:   recruiter@techcorp.com / password123');
    console.log('3. Job Seeker:  alex@example.com / password123');
    console.log('4. Job Seeker:  elena@example.com / password123');
    console.log('-------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
