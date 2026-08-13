// Daily theme mock data
export const DAILY_THEME = {
    letter: "Aa",
    label: "Letter A",
    subtitle: "Today's featured letter",
    title: "Alphabet Learning: Module 1",
    description:
        "Focusing on phonetic sounds of vowels and identifying everyday objects that begin with the letter A.",
    objectives: [
        "Identify the letter 'A' in five different words.",
        "Trace uppercase and lowercase 'A' correctly.",
        "Recognize objects beginning with the letter 'A'.",
    ],
};

// Mock data for attendance records
export const initialRecords = [
    { id: 1, name: "Chloe Garcia", shift:"AM", status: "present", time: "7:58 am", date: "2026-08-13" },
    { id: 2, name: "Lucas Ramirez", shift:"AM", status: "present", time: "7:52 am", date: "2026-08-13" },
    { id: 3, name: "Leo Miller", shift:"AM", status: "present", time: "7:58 am", date: "2026-08-13" },
    { id: 4, name: "Emma Johnson", shift:"AM", status: "present", time: "7:55 am", date: "2026-08-13" },
    { id: 5, name: "Lian Smith", shift:"AM", status: "present", time: "7:56 am", date: "2026-08-13" },
    { id: 6, name: "Noah Davis", shift:"AM", status: "absent", time: "—", date: "2026-08-13" },
    { id: 7, name: "Olivia Brown", shift:"AM", status: "excused", time: "—", date: "2026-08-13" },
    { id: 8, name: "Ave Castillo", shift:"AM", status: "present", time: "7:50 am", date: "2026-08-13" },
    { id: 9, name: "Isabella Thomas", shift:"AM", status: "present", time: "7:51 AM", date: "2026-08-13" },
    { id: 10, name: "Lucas Jackson", shift:"AM", status: "present", time: "7:54 AM", date: "2026-08-13" },
];

// Dashboard stats mock data
export const DASHBOARD_STATS = {
    totalStudents: initialRecords.length,
    presentToday: initialRecords.filter(
        (record) => record.status === "present"
    ).length,
    absentToday: initialRecords.filter(
        (record) => record.status !== "present"
    ).length,
};

// Mock data for learning materials
export const MATERIALS_DATA = [
    {
        id: 1,
        title: "Color Mixing Workbook",
        category: "Art & Creativity",
        description:
            "Guided exercises for learning primary and secondary colors through painting.",
        bgColor: "bg-gradient-to-r from-orange-400 to-purple-500",
        icon: "🎨",
    },
    {
        id: 2,
        title: "Shape Sorting Masterclass",
        category: "Mathematics",
        description:
            "Interactive patterns for geometry recognition and spatial awareness training.",
        bgColor: "bg-orange-300",
        icon: "🟢🟨🔺",
    },
    {
        id: 3,
        title: "Storytelling Prompts",
        category: "Language",
        description:
            "20 Creative prompt cards to encourage verbal expression and narrative skills.",
        bgColor: "bg-blue-200",
        icon: "📚",
    },
    {
        id: 4,
        title: "Phonics Flashcard",
        category: "Language",
        description:
            "Printable flashcards focusing on vowel sounds and high-frequency sight words.",
        bgColor: "bg-blue-100",
        icon: "📖",
    },
    {
        id: 5,
        title: "Number Recognition & Counting",
        category: "Mathematics",
        description:
            "Activity sheets for children aged 3-5 to master basic numerals and cardinality.",
        bgColor: "bg-rose-100",
        icon: "🔢",
    },
];

// Mock data for photo albums
export const PHOTO_ALBUMS_DATA = [
    {
        id: 1,
        title: "Outdoor Play Day",
        date: "July 20, 2024",
        photoCount: 24,
        description: "Fun times on the playground during outdoor activities.",
        category: "Activities",
        photos: [
            {
                id: 1,
                url: "https://placehold.co/600x400/FF6B6B/FFFFFF?text=Photo+1",
                caption: "Kids playing tag",
            },
            {
                id: 2,
                url: "https://placehold.co/600x400/FF6B6B/FFFFFF?text=Photo+2",
                caption: "Swings time",
            },
            {
                id: 3,
                url: "https://placehold.co/600x400/FF6B6B/FFFFFF?text=Photo+3",
                caption: "Slide adventure",
            },
            {
                id: 4,
                url: "https://placehold.co/600x400/FF6B6B/FFFFFF?text=Photo+4",
                caption: "Group photo",
            },
            {
                id: 5,
                url: "https://placehold.co/600x400/FF6B6B/FFFFFF?text=Photo+5",
                caption: "Sandbox fun",
            },
            {
                id: 6,
                url: "https://placehold.co/600x400/FF6B6B/FFFFFF?text=Photo+6",
                caption: "Running races",
            },
        ],
    },
    {
        id: 2,
        title: "Art & Craft Session",
        date: "July 15, 2024",
        photoCount: 18,
        description:
            "Creative masterpieces from our painting and crafting workshop.",
        category: "Art",
        photos: [
            {
                id: 1,
                url: "https://placehold.co/600x400/FFD93D/FFFFFF?text=Art+1",
                caption: "Painting session",
            },
            {
                id: 2,
                url: "https://placehold.co/600x400/FFD93D/FFFFFF?text=Art+2",
                caption: "Crafts display",
            },
            {
                id: 3,
                url: "https://placehold.co/600x400/FFD93D/FFFFFF?text=Art+3",
                caption: "Coloring fun",
            },
            {
                id: 4,
                url: "https://placehold.co/600x400/FFD93D/FFFFFF?text=Art+4",
                caption: "Art showcase",
            },
        ],
    },
];

// Mock data for students
export const studentDataAll = {
    "POB2-2026-001": {
        student: {
            id: "POB2-2026-001",
            name: "Leo Miller",
            photo: "https://placehold.co/150x150/png?text=Leo+Miller",
            birthday: "2022-04-20",
            address: "Purok 1, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active",
        },
        guardians: [
            {
                id: 1,
                type: "Mother",
                name: "Sarah Miller",
                address: "Purok 1, Poblacion",
                phone: "0912-345-6789",
                email: "SarahMiller@email.com",
            },
            {
                id: 2,
                type: "Father",
                name: "Michael Miller",
                address: "Purok 1, Poblacion",
                phone: "0923-456-7890",
                email: "MichaelMiller@email.com",
            },
        ],
        medical: {
            allergies: "None",
            allergiesDetail: "No known allergies.",
            dietary: "Regular Diet",
            dietaryDetail: "No dietary restrictions.",
            accommodations: "Standard Classroom",
            accommodationsDetail: "Leo is comfortable in standard classroom settings.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Enrollment_Form.pdf", verified: true },
        ],
    },

    "POB2-2026-002": {
        student: {
            id: "POB2-2026-002",
            name: "Chloe Garcia",
            photo: "https://placehold.co/150x150/png?text=Chloe+Garcia",
            birthday: "2021-02-12",
            address: "Purok 3, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Father",
                name: "David Garcia",
                address: "Purok 3, Poblacion",
                phone: "0998-765-4321",
                email: "DavidGarcia@email.com",
            },
            {
                id: 2,
                type: "Mother",
                name: "Rosa Garcia",
                address: "Purok 3, Poblacion",
                phone: "0910-234-5678",
                email: "RosaGarcia@email.com",
            },
        ],
        medical: {
            allergies: "Milk",
            allergiesDetail: "Lactose intolerant. Provide dairy-free alternatives.",
            dietary: "Dairy-Free Diet",
            dietaryDetail: "Requires dairy-free milk and products.",
            accommodations: "Dietary Accommodation",
            accommodationsDetail: "Lunch must be dairy-free. Alternative milk available.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Medical_Report.pdf", verified: true },
        ],
    },

    "POB2-2026-003": {
        student: {
            id: "POB2-2026-003",
            name: "Lucas Ramirez",
            photo: "https://placehold.co/150x150/png?text=Lucas+Ramirez",
            birthday: "2022-07-18",
            address: "Purok 2, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Mother",
                name: "Maria Ramirez",
                address: "Purok 2, Poblacion",
                phone: "0917-234-5678",
                email: "MariaRamirez@email.com",
            },
        ],
        medical: {
            allergies: "None",
            allergiesDetail: "No known allergies.",
            dietary: "Regular Diet",
            dietaryDetail: "No dietary restrictions.",
            accommodations: "Standard Classroom",
            accommodationsDetail: "Lucas adapts well to classroom environment.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Enrollment_Form.pdf", verified: true },
        ],
    },

    "POB2-2026-004": {
        student: {
            id: "POB2-2026-004",
            name: "Emma Johnson",
            photo: "https://placehold.co/150x150/png?text=Emma+Johnson",
            birthday: "2020-11-03",
            address: "Purok 4, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Father",
                name: "Robert Johnson",
                address: "Purok 4, Poblacion",
                phone: "0923-456-7890",
                email: "RobertJohnson@email.com",
            },
            {
                id: 2,
                type: "Mother",
                name: "Elizabeth Johnson",
                address: "Purok 4, Poblacion",
                phone: "0915-567-8901",
                email: "ElizabethJohnson@email.com",
            },
        ],
        medical: {
            allergies: "Shellfish",
            allergiesDetail: "Severe allergy. Do not serve any shellfish products.",
            dietary: "Shellfish-Free Diet",
            dietaryDetail: "Avoid all seafood containing shellfish.",
            accommodations: "Allergy Management",
            accommodationsDetail: "Antihistamine available in classroom. Parent contacted immediately if exposure occurs.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Allergy_Test_Results.pdf", verified: true },
        ],
    },

    "POB2-2026-005": {
        student: {
            id: "POB2-2026-005",
            name: "Lian Smith",
            photo: "https://placehold.co/150x150/png?text=Lian+Smith",
            birthday: "2022-06-25",
            address: "Purok 1, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Mother",
                name: "Michelle Smith",
                address: "Purok 1, Poblacion",
                phone: "0909-567-8901",
                email: "MichelleSmith@email.com",
            },
        ],
        medical: {
            allergies: "None",
            allergiesDetail: "No known allergies.",
            dietary: "Vegetarian Diet",
            dietaryDetail: "Prefers plant-based meals. No meat products.",
            accommodations: "Dietary Preference",
            accommodationsDetail: "Vegetarian options provided during lunch.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Enrollment_Form.pdf", verified: true },
        ],
    },

    "POB2-2026-006": {
        student: {
            id: "POB2-2026-006",
            name: "Noah Davis",
            photo: "https://placehold.co/150x150/png?text=Noah+Davis",
            birthday: "2021-09-14",
            address: "Purok 5, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Father",
                name: "James Davis",
                address: "Purok 5, Poblacion",
                phone: "0921-678-9012",
                email: "JamesDavis@email.com",
            },
            {
                id: 2,
                type: "Mother",
                name: "Amanda Davis",
                address: "Purok 5, Poblacion",
                phone: "0914-789-0123",
                email: "AmandaDavis@email.com",
            },
        ],
        medical: {
            allergies: "Eggs",
            allergiesDetail: "Mild allergy. Causes mild rash. Avoid eggs and egg-based products.",
            dietary: "Egg-Free Diet",
            dietaryDetail: "No eggs or egg-containing foods.",
            accommodations: "Dietary Management",
            accommodationsDetail: "Egg alternatives provided for breakfast and snacks.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Enrollment_Form.pdf", verified: true },
        ],
    },

    "POB2-2026-007": {
        student: {
            id: "POB2-2026-007",
            name: "Olivia Brown",
            photo: "https://placehold.co/150x150/png?text=Olivia+Brown",
            birthday: "2022-03-08",
            address: "Purok 2, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Mother",
                name: "Lisa Brown",
                address: "Purok 2, Poblacion",
                phone: "0929-789-0123",
                email: "LisaBrown@email.com",
            },
        ],
        medical: {
            allergies: "None",
            allergiesDetail: "No known allergies.",
            dietary: "Regular Diet",
            dietaryDetail: "No dietary restrictions.",
            accommodations: "Hearing Support",
            accommodationsDetail: "Mild hearing sensitivity. Prefers quieter environments during transitions.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Audiological_Assessment.pdf", verified: true },
        ],
    },

    "POB2-2026-008": {
        student: {
            id: "POB2-2026-008",
            name: "Ave Castillo",
            photo: "https://placehold.co/150x150/png?text=Ave+Castillo",
            birthday: "2020-12-19",
            address: "Purok 6, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Father",
                name: "Antonio Castillo",
                address: "Purok 6, Poblacion",
                phone: "0915-890-1234",
                email: "AntonioCastillo@email.com",
            },
            {
                id: 2,
                type: "Mother",
                name: "Carmen Castillo",
                address: "Purok 6, Poblacion",
                phone: "0922-901-2345",
                email: "CarmenCastillo@email.com",
            },
        ],
        medical: {
            allergies: "None",
            allergiesDetail: "No known allergies.",
            dietary: "Regular Diet",
            dietaryDetail: "No dietary restrictions.",
            accommodations: "Standard Classroom",
            accommodationsDetail: "Ave is an active learner and engages well with peers.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Enrollment_Form.pdf", verified: true },
        ],
    },

    "POB2-2026-009": {
        student: {
            id: "POB2-2026-009",
            name: "Isabella Thomas",
            photo: "https://placehold.co/150x150/png?text=Isabella+Thomas",
            birthday: "2022-05-30",
            address: "Purok 3, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Mother",
                name: "Patricia Thomas",
                address: "Purok 3, Poblacion",
                phone: "0922-901-2345",
                email: "PatriciaThomas@email.com",
            },
        ],
        medical: {
            allergies: "Peanuts, Tree Nuts",
            allergiesDetail: "Severe nut allergy. EpiPen located in classroom locker #05.",
            dietary: "Nut-Free Diet",
            dietaryDetail: "Strict avoidance of all nut products.",
            accommodations: "Allergy Management",
            accommodationsDetail: "Separate lunch area. All snacks checked for nut content.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Allergy_Management_Plan.pdf", verified: true },
        ],
    },

    "POB2-2026-010": {
        student: {
            id: "POB2-2026-010",
            name: "Lucas Jackson",
            photo: "https://placehold.co/150x150/png?text=Lucas+Jackson",
            birthday: "2021-08-11",
            address: "Purok 4, Poblacion",
            session: "Morning (AM)",
            school: "Poblacion II ECCD Center",
            teacher: "Mrs. Sarah Johnson",
            status: "Active Student",
        },
        guardians: [
            {
                id: 1,
                type: "Mother",
                name: "Jennifer Jackson",
                address: "Purok 4, Poblacion",
                phone: "0916-012-3456",
                email: "JenniferJackson@email.com",
            },
            {
                id: 2,
                type: "Father",
                name: "Christopher Jackson",
                address: "Purok 4, Poblacion",
                phone: "0925-123-4567",
                email: "ChristopherJackson@email.com",
            },
        ],
        medical: {
            allergies: "None",
            allergiesDetail: "No known allergies.",
            dietary: "Regular Diet",
            dietaryDetail: "No dietary restrictions.",
            accommodations: "Standard Classroom",
            accommodationsDetail: "Lucas is social and enjoys group activities.",
        },
        documents: [
            { id: 1, name: "Birth_Certificate.pdf", verified: true },
            { id: 2, name: "Immunization_Records.pdf", verified: true },
            { id: 3, name: "Enrollment_Form.pdf", verified: true },
        ],
    },
};

// Helper function to get student data by ID
export const getStudentData = (studentId) => {
    return studentDataAll[studentId];
};

// Helper function to get all students
export const getAllStudentsData = () => {
    return Object.values(studentDataAll);
};
