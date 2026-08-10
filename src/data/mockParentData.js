// Mock data for parent's child
export const CHILD_DATA = {
  id: "POB2-2026-001",
  photo: "https://placehold.co/150x150",
  name: "Leo Miller",
  session: "Morning (am)",
  enrollmentDate: "June 2026",
  teacher: "Mrs. Sarah Johnson",
};

// Mock progress data
export const PROGRESS_DATA = {
  milestones: 1,
  attendance: "100%",
  schoolDays: 60,
  activityCount: 3,
  recentActivities: [
    {
      id: 1,
      date: "Today",
      activity: "Color Mixing Workshop",
      category: "Art & Creativity",
      status: "completed",
      notes: "Leo showed great enthusiasm during the color mixing activity!",
    },
    {
      id: 2,
      date: "Yesterday",
      activity: "Shape Recognition Game",
      category: "Mathematics",
      status: "completed",
      notes: "Perfect score on shape identification.",
    },
    {
      id: 3,
      date: "Dec 15",
      activity: "Storytelling Session",
      category: "Language",
      status: "completed",
      notes: "Shared an engaging story with great expression.",
    },
  ],
  weeklyGoals: [
    {
      id: 1,
      title: "Master counting to 10",
      progress: 85,
      status: "In Progress",
    },
    {
      id: 2,
      title: "Improve letter tracing",
      progress: 70,
      status: "In Progress",
    },
    {
      id: 3,
      title: "Participate in group activities",
      progress: 100,
      status: "Completed",
    },
  ],
};

// Mock attendance data
export const ATTENDANCE_DATA = {
  "2026-08": {
    stats: {
      presentDays: 3,
      absentDays: 0,
      excusedDays: 2,
      attendanceRate: 100,
      lateArrivals: 1,
    },
    logs: [
      {
        date: "Aug 03, 2026",
        time: "---",
        status: "No Classes",
      },
      {
        date: "Aug 04, 2026",
        time: "8:15 AM",
        status: "Late",
      },
      {
        date: "Aug 05, 2026",
        time: "7:55 AM",
        status: "completed",
      },
      {
        date: "Aug 06, 2026",
        time: "---",
        status: "No Classes",
      },
      {
        date: "Aug 07, 2026",
        time: "7:58 AM",
        status: "completed",
      },
    ],
    daily: {
      3: "excused",
      4: "present",
      5: "present",
      6: "excused",
      7: "present",
    },
  },
};

// Mock materials data
export const MATERIALS_DATA = [
  {
    id: 1,
    title: "Color Mixing Workbook",
    category: "Art & Creativity",
    description:
      "Guided exercises for learning primary and secondary colors through painting.",
    createdBy: "Mrs. Sarah Johnson",
    date: "Aug 3, 2026",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/materials/1",
  },
  {
    id: 2,
    title: "Shape Sorting Masterclass",
    category: "Mathematics",
    description:
      "Interactive patterns for geometry recognition and spatial awareness training.",
    createdBy: "Mrs. Sarah Johnson",
    date: "Aug 4, 2026",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/materials/2",
  },
  {
    id: 3,
    title: "Storytelling Prompts",
    category: "Language",
    description:
      "20 Creative prompt cards to encourage verbal expression and narrative skills.",
    createdBy: "Mrs. Sarah Johnson",
    date: "Aug 5, 2026",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/materials/3",
  },
  {
    id: 4,
    title: "Phonics Flashcard",
    category: "Language",
    description:
      "Printable flashcards focusing on vowel sounds and high-frequency sight words.",
    createdBy: "Mrs. Sarah Johnson",
    date: "Aug 6, 2026",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/materials/4",
  },
];

// Mock photo albums data
export const PHOTO_ALBUMS_DATA = [
  {
    id: 1,
    title: "Field Day 2024",
    description: "Great day at the playground!",
    category: "Field Trip",
    createdBy: "Mrs. Sarah Johnson",
    date: "Dec 10, 2024",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/photo-gallery/1",
  },
  {
    id: 2,
    title: "Art & Craft Session",
    description: "Creative masterpieces from our painting workshop.",
    category: "Art",
    createdBy: "Mrs. Sarah Johnson",
    date: "Dec 8, 2024",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/photo-gallery/2",
  },
  {
    id: 3,
    title: "Outdoor Play Day",
    description: "Fun times on the playground during outdoor activities.",
    category: "Activities",
    createdBy: "Mrs. Sarah Johnson",
    date: "Dec 5, 2024",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/photo-gallery/3",
  },
  {
    id: 4,
    title: "Music & Movement Class",
    description: "Our children exploring rhythm and movement.",
    category: "Music",
    createdBy: "Mrs. Sarah Johnson",
    date: "Dec 1, 2024",
    thumbnail: "https://placehold.co/300x200",
    url: "/parent/photo-gallery/4",
  },
];