export interface ClubMember {
  name: string;
  role: string;
  avatar: string;
}

export interface ClubEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  isFree: boolean;
  price?: number;
  attendees: number;
  spotsLeft: number;
  image?: string;
}

export interface ClubPost {
  id: string;
  text: string;
  date: string;
  likes: number;
  isPinned: boolean;
  image?: string;
}

export interface Club {
  slug: string;
  name: string;
  category: string;
  description: string;
  tagline: string;
  members: number;
  founded: number;
  nextEvent?: string;
  nextEventPrice?: number;
  bannerGradient: string;
  logoLetter: string;
  focusTags: string[];
  advisor: string;
  socials: { instagram?: string; linkedin?: string };
  team: ClubMember[];
  events: ClubEvent[];
  posts: ClubPost[];
}

export const categories = [
  "All",
  "Technical",
  "Cultural",
  "Social Impact",
  "Sports",
  "Arts",
  "Mental Health",
  "Entrepreneurship",
];

export const categoryColors: Record<string, string> = {
  Technical: "from-blue-500/80 to-blue-600/80",
  Cultural: "from-primary/80 to-purple-600/80",
  "Social Impact": "from-emerald-500/80 to-green-600/80",
  Arts: "from-accent/80 to-orange-600/80",
  "Mental Health": "from-pink-500/80 to-rose-600/80",
  Sports: "from-yellow-500/80 to-amber-600/80",
  Entrepreneurship: "from-cyan-500/80 to-teal-600/80",
};

export const categoryTextColors: Record<string, string> = {
  Technical: "text-blue-400",
  Cultural: "text-purple-400",
  "Social Impact": "text-emerald-400",
  Arts: "text-orange-400",
  "Mental Health": "text-pink-400",
  Sports: "text-yellow-400",
  Entrepreneurship: "text-cyan-400",
};

export const clubs: Club[] = [
  {
    slug: "google-dsc",
    name: "Google DSC Galgotias",
    category: "Technical",
    description: "Google Developer Student Clubs is a community group for college students interested in Google developer technologies. We host workshops, hackathons, and study jams on Flutter, Android, Cloud, ML, and Web.",
    tagline: "Learn. Build. Grow with Google.",
    members: 234,
    founded: 2019,
    nextEvent: "Flutter Workshop — Dec 15",
    bannerGradient: "from-blue-600/40 to-primary/30",
    logoLetter: "G",
    focusTags: ["Flutter", "Android", "Cloud", "ML", "Web Dev"],
    advisor: "Dr. Priya Sharma",
    socials: { instagram: "#", linkedin: "#" },
    team: [
      { name: "Arjun Mehta", role: "President", avatar: "AM" },
      { name: "Sneha Gupta", role: "Vice President", avatar: "SG" },
      { name: "Ravi Kumar", role: "Tech Lead", avatar: "RK" },
      { name: "Priya Singh", role: "Design Lead", avatar: "PS" },
    ],
    events: [
      { id: "1", name: "Flutter Workshop", date: "Dec 15, 2026", time: "10:00 AM", location: "Auditorium B", isFree: true, attendees: 47, spotsLeft: 53 },
      { id: "2", name: "Cloud Study Jam", date: "Jan 8, 2027", time: "2:00 PM", location: "Online", isFree: true, attendees: 120, spotsLeft: 80 },
    ],
    posts: [
      { id: "1", text: "🎉 Congrats to Team Alpha for winning the Internal Hackathon! Amazing 48-hour sprint.", date: "Dec 10, 2026", likes: 89, isPinned: true },
      { id: "2", text: "Flutter Workshop registrations open! Limited to 100 seats. Grab yours now.", date: "Dec 8, 2026", likes: 45, isPinned: false },
    ],
  },
  {
    slug: "drama-society",
    name: "Drama Society",
    category: "Cultural",
    description: "The Drama Society is the heart of performing arts on campus. From street plays to full-length productions, we bring stories to life on stage.",
    tagline: "Every stage is a world.",
    members: 89,
    founded: 2015,
    nextEvent: "Annual Play — Dec 20",
    nextEventPrice: 50,
    bannerGradient: "from-purple-600/40 to-pink-500/30",
    logoLetter: "D",
    focusTags: ["Theatre", "Street Play", "Improv", "Writing"],
    advisor: "Prof. Ananya Banerjee",
    socials: { instagram: "#" },
    team: [
      { name: "Kavya Nair", role: "President", avatar: "KN" },
      { name: "Rohan Das", role: "Director", avatar: "RD" },
    ],
    events: [
      { id: "3", name: "Annual Play: Shadows", date: "Dec 20, 2026", time: "6:00 PM", location: "Main Auditorium", isFree: false, price: 50, attendees: 180, spotsLeft: 20 },
    ],
    posts: [
      { id: "3", text: "Rehearsals in full swing for 'Shadows'! This year's annual play is going to be epic. 🎭", date: "Dec 12, 2026", likes: 67, isPinned: true },
    ],
  },
  {
    slug: "mental-health-society",
    name: "Mental Health Society",
    category: "Mental Health",
    description: "A safe space for students to talk, heal, and grow. We organize wellness workshops, peer counseling sessions, and awareness drives.",
    tagline: "It's okay to not be okay.",
    members: 156,
    founded: 2021,
    nextEvent: "Stress Free Week — Dec 18",
    bannerGradient: "from-pink-500/40 to-rose-400/30",
    logoLetter: "M",
    focusTags: ["Wellness", "Counseling", "Meditation", "Awareness"],
    advisor: "Dr. Meera Joshi",
    socials: { instagram: "#", linkedin: "#" },
    team: [
      { name: "Ishita Verma", role: "President", avatar: "IV" },
      { name: "Aman Jain", role: "Outreach Lead", avatar: "AJ" },
      { name: "Riya Patel", role: "Events Head", avatar: "RP" },
    ],
    events: [
      { id: "4", name: "Stress Free Week", date: "Dec 18, 2026", time: "All Day", location: "Campus Grounds", isFree: true, attendees: 95, spotsLeft: 200 },
    ],
    posts: [
      { id: "4", text: "💚 This week's affirmation: You are enough. Always have been, always will be.", date: "Dec 9, 2026", likes: 134, isPinned: false },
    ],
  },
  {
    slug: "e-cell",
    name: "E-Cell (Entrepreneurship Cell)",
    category: "Entrepreneurship",
    description: "Fostering the startup culture on campus. From pitch nights to investor connects, E-Cell is where ideas become businesses.",
    tagline: "Ideas to Impact.",
    members: 178,
    founded: 2017,
    nextEvent: "Startup Pitch Night — Jan 5",
    bannerGradient: "from-cyan-500/40 to-teal-400/30",
    logoLetter: "E",
    focusTags: ["Startups", "Pitching", "VC", "Product"],
    advisor: "Prof. Vikram Rao",
    socials: { instagram: "#", linkedin: "#" },
    team: [
      { name: "Aditya Chopra", role: "President", avatar: "AC" },
      { name: "Nisha Reddy", role: "VP Operations", avatar: "NR" },
    ],
    events: [
      { id: "5", name: "Startup Pitch Night", date: "Jan 5, 2027", time: "5:00 PM", location: "Innovation Hub", isFree: true, attendees: 62, spotsLeft: 38 },
    ],
    posts: [
      { id: "5", text: "🚀 3 teams from our incubator just got accepted to Y Combinator interviews!", date: "Dec 11, 2026", likes: 203, isPinned: true },
    ],
  },
  {
    slug: "art-design-club",
    name: "Art & Design Club",
    category: "Arts",
    description: "Where creativity meets canvas. Painting, digital art, UI/UX design, photography — if you create, you belong here.",
    tagline: "Create without limits.",
    members: 67,
    founded: 2020,
    nextEvent: "Winter Exhibition — Dec 22",
    nextEventPrice: 30,
    bannerGradient: "from-accent/40 to-amber-400/30",
    logoLetter: "A",
    focusTags: ["Painting", "Digital Art", "UI/UX", "Photography"],
    advisor: "Prof. Samira Khan",
    socials: { instagram: "#" },
    team: [
      { name: "Tanvi Bhatt", role: "President", avatar: "TB" },
      { name: "Karan Malhotra", role: "Creative Director", avatar: "KM" },
    ],
    events: [
      { id: "6", name: "Winter Exhibition", date: "Dec 22, 2026", time: "11:00 AM", location: "Gallery Wing", isFree: false, price: 30, attendees: 35, spotsLeft: 65 },
    ],
    posts: [
      { id: "6", text: "🎨 Submissions open for the Winter Exhibition! DM us your best work.", date: "Dec 5, 2026", likes: 42, isPinned: false },
    ],
  },
  {
    slug: "nss",
    name: "NSS (National Service Scheme)",
    category: "Social Impact",
    description: "Serving the community, one initiative at a time. Blood drives, village outreach, environmental cleanups — we make a difference.",
    tagline: "Not me, but you.",
    members: 312,
    founded: 2010,
    nextEvent: "Blood Donation Camp — Dec 12",
    bannerGradient: "from-emerald-500/40 to-green-400/30",
    logoLetter: "N",
    focusTags: ["Community", "Health", "Environment", "Education"],
    advisor: "Dr. Rajesh Kapoor",
    socials: { linkedin: "#" },
    team: [
      { name: "Deepak Sharma", role: "President", avatar: "DS" },
      { name: "Anita Kumari", role: "Secretary", avatar: "AK" },
      { name: "Suresh Yadav", role: "Events Coordinator", avatar: "SY" },
    ],
    events: [
      { id: "7", name: "Blood Donation Camp", date: "Dec 12, 2026", time: "9:00 AM", location: "Medical Center", isFree: true, attendees: 89, spotsLeft: 111 },
    ],
    posts: [
      { id: "7", text: "🩸 Last camp we collected 200+ units! Let's beat that record this time.", date: "Dec 7, 2026", likes: 156, isPinned: true },
    ],
  },
];
