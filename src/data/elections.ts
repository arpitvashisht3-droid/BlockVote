export type ElectionStatus = 'live' | 'upcoming' | 'ended'

export const electionTypes = [
  'General Election',
  'Student Election',
  'Organization Election',
  'Committee Election',
] as const

export type ElectionType = (typeof electionTypes)[number]

export type ElectionSort = 'default' | 'votes' | 'title'

export type Candidate = {
  id: string
  name: string
  department: string
  about: string
  achievements: string[]
  position?: string
  removed?: boolean
}

export type CandidateResult = {
  candidateId: string
  votes: number
  percentage: number
}

export type ElectionResults = {
  totalVotes: number
  registeredVoters: number
  turnoutPercent: number
  blockHeight: number
  resultsFinalizedDate: string
  winnerId: string
  candidateResults: CandidateResult[]
}

export type Election = {
  id: string
  title: string
  description: string
  detailsDescription: string
  status: ElectionStatus
  electionCode: string
  startDate: string
  endDate: string
  voterStatus: string
  timeLabel: string
  voteCount?: number
  turnoutPercent?: number
  published?: boolean
  results?: ElectionResults
  candidates: Candidate[]
  organization?: string
  electionType?: ElectionType
  thumbnail: {
    icon: 'landmark' | 'cpu' | 'music' | 'graduation'
    tone: 'navy' | 'teal' | 'indigo' | 'slate'
  }
}

export const elections: Election[] = [
  {
    id: 'student-council-2024',
    title: 'Student Council Election 2024',
    description: 'Vote for your student council representatives.',
    detailsDescription:
      'Choose your representatives for the student council who will shape your campus experience.',
    status: 'live',
    electionCode: 'BLC-2024-001',
    startDate: '20 May 2024, 09:00 AM',
    endDate: '25 May 2024, 09:00 PM',
    voterStatus: 'Eligible to vote',
    timeLabel: 'Ends in 3h 17m',
    voteCount: 1247,
    turnoutPercent: 62,
    results: {
      totalVotes: 5253,
      registeredVoters: 7842,
      turnoutPercent: 67,
      blockHeight: 18492731,
      resultsFinalizedDate: '25 May 2024, 09:15 PM',
      winnerId: 'rahul-sharma',
      candidateResults: [
        { candidateId: 'rahul-sharma', votes: 2847, percentage: 54.2 },
        { candidateId: 'aman-verma', votes: 1674, percentage: 31.9 },
        { candidateId: 'priya-singh', votes: 732, percentage: 13.9 },
      ],
    },
    thumbnail: { icon: 'landmark', tone: 'navy' },
    organization: 'ABC University',
    electionType: 'Student Election',
    candidates: [
      {
        id: 'rahul-sharma',
        name: 'Rahul Sharma',
        department: 'Computer Science',
        position: 'President',
        about:
          'A passionate leader with a vision to improve student life and the academic environment. Committed to transparency, innovation, and student welfare.',
        achievements: [
          'College Coding Champion 2023',
          'Organized Tech-Fest 2022',
          'IEEE Volunteer',
          'Active member of Coding Club',
        ],
      },
      {
        id: 'aman-verma',
        name: 'Aman Verma',
        department: 'Electronics',
        position: 'President',
        about:
          'Focused on better campus facilities, open labs, and practical learning. Wants student council decisions to stay public and easy to follow.',
        achievements: [
          'Robotics Club Lead 2023',
          'IoT Hackathon Winner',
          'Department Representative',
          'Peer tutor for first-year students',
        ],
      },
      {
        id: 'priya-singh',
        name: 'Priya Singh',
        department: 'Information Technology',
        position: 'President',
        about:
          'Advocates for inclusive campus events, mental-health support, and a fair grievance process. Believes every vote should be easy to verify.',
        achievements: [
          'Student Outreach Coordinator',
          'Women in Tech mentor',
          'Cultural Fest volunteer lead',
          'Dean’s List, 2023',
        ],
      },
    ],
  },
  {
    id: 'tech-club-president',
    title: 'Tech Club President Election',
    description: 'Choose the next president of the Tech Club.',
    detailsDescription:
      'Select the next Tech Club president to lead workshops, hackathons, and campus tech initiatives.',
    status: 'upcoming',
    electionCode: 'BLC-2024-002',
    startDate: '14 Jun 2024, 09:00 AM',
    endDate: '16 Jun 2024, 09:00 PM',
    voterStatus: 'Voting has not started',
    timeLabel: 'Starts 14th Jun',
    thumbnail: { icon: 'cpu', tone: 'teal' },
    organization: 'Campus Tech Club',
    electionType: 'Organization Election',
    candidates: [
      {
        id: 'neha-kapoor',
        name: 'Neha Kapoor',
        department: 'Computer Science',
        position: 'President',
        about:
          'Plans weekly build nights, beginner-friendly workshops, and stronger industry mentorship for club members.',
        achievements: [
          'Club Workshop Lead',
          'Open-source contributor',
          'Smart India Hackathon finalist',
        ],
      },
      {
        id: 'arjun-mehta',
        name: 'Arjun Mehta',
        department: 'Information Technology',
        position: 'Vice President',
        about:
          'Wants the Tech Club to publish every decision and budget on-chain so members can audit how events are funded.',
        achievements: [
          'Campus Blockchain Group founder',
          'CTF team captain',
          'Peer programming mentor',
        ],
      },
      {
        id: 'sara-dsouza',
        name: 'Sara D’Souza',
        department: 'Electronics',
        position: 'Secretary',
        about:
          'Focused on hardware-software collabs, maker-space access, and a clearer onboarding path for first-year members.',
        achievements: [
          'Hardware Lab volunteer',
          'IEEE student member',
          'Organized IoT demo day',
        ],
      },
    ],
  },
  {
    id: 'cultural-fest-committee',
    title: 'Cultural Fest Committee',
    description: 'Elect representatives for the Cultural Fest Committee.',
    detailsDescription:
      'Elect the committee that will plan performances, stalls, and guest events for this year’s cultural fest.',
    status: 'ended',
    electionCode: 'BLC-2024-003',
    startDate: '6 May 2024, 09:00 AM',
    endDate: '10 May 2024, 09:00 PM',
    voterStatus: 'Voting closed',
    timeLabel: 'Ended on 10 May 2024',
    voteCount: 956,
    published: true,
    results: {
      totalVotes: 956,
      registeredVoters: 1400,
      turnoutPercent: 68.3,
      blockHeight: 18481200,
      resultsFinalizedDate: '10 May 2024, 09:20 PM',
      winnerId: 'meera-nair',
      candidateResults: [
        { candidateId: 'meera-nair', votes: 486, percentage: 50.8 },
        { candidateId: 'ishaan-rao', votes: 297, percentage: 31.1 },
        { candidateId: 'kabir-singh', votes: 173, percentage: 18.1 },
      ],
    },
    thumbnail: { icon: 'music', tone: 'indigo' },
    organization: 'Cultural Committee',
    electionType: 'Committee Election',
    candidates: [
      {
        id: 'ishaan-rao',
        name: 'Ishaan Rao',
        department: 'Arts',
        position: 'Secretary',
        about:
          'Aimed to keep fest programming student-led, with transparent vendor selection and open rehearsal slots.',
        achievements: [
          'Drama Club secretary',
          'Fest stage manager 2023',
          'Campus radio host',
        ],
      },
      {
        id: 'meera-nair',
        name: 'Meera Nair',
        department: 'Commerce',
        position: 'Chair',
        about:
          'Pushed for better crowd flow, accessible seating, and a published budget for every fest vertical.',
        achievements: [
          'Event operations lead',
          'Sponsorship coordinator',
          'Volunteer training lead',
        ],
      },
      {
        id: 'kabir-singh',
        name: 'Kabir Singh',
        department: 'Music',
        position: 'Treasurer',
        about:
          'Wanted more independent artist showcases and a fair slot lottery for student bands.',
        achievements: [
          'Music society president',
          'Battle of Bands organizer',
          'Campus playlist curator',
        ],
      },
    ],
  },
  {
    id: 'academic-council',
    title: 'Academic Council Election',
    description: 'Select faculty and student voices for the Academic Council.',
    detailsDescription:
      'Choose student representatives who will sit on the Academic Council and speak for coursework, calendars, and campus policy.',
    status: 'ended',
    electionCode: 'BLC-2024-004',
    startDate: '28 Mar 2024, 09:00 AM',
    endDate: '2 Apr 2024, 09:00 PM',
    voterStatus: 'Voting closed',
    timeLabel: 'Ended on 2 Apr 2024',
    voteCount: 2184,
    turnoutPercent: 71,
    published: true,
    results: {
      totalVotes: 2184,
      registeredVoters: 3076,
      turnoutPercent: 71,
      blockHeight: 18470112,
      resultsFinalizedDate: '2 Apr 2024, 09:20 PM',
      winnerId: 'ananya-joshi',
      candidateResults: [
        { candidateId: 'ananya-joshi', votes: 1098, percentage: 50.3 },
        { candidateId: 'rohan-patel', votes: 718, percentage: 32.9 },
        { candidateId: 'zara-khan', votes: 368, percentage: 16.8 },
      ],
    },
    thumbnail: { icon: 'graduation', tone: 'slate' },
    organization: 'Academic Council',
    electionType: 'General Election',
    candidates: [
      {
        id: 'ananya-joshi',
        name: 'Ananya Joshi',
        department: 'Economics',
        position: 'Representative',
        about:
          'Advocated for clearer grading rubrics, published exam calendars, and student seats in curriculum reviews.',
        achievements: [
          'Academic affairs representative',
          'Research symposium coordinator',
          'Dean’s List, 2022–2024',
        ],
      },
      {
        id: 'rohan-patel',
        name: 'Rohan Patel',
        department: 'Mechanical Engineering',
        position: 'Representative',
        about:
          'Focused on lab access hours, internship credit policy, and a simpler process for course-load appeals.',
        achievements: [
          'Engineering society VP',
          'Formula student team member',
          'Teaching assistant',
        ],
      },
      {
        id: 'zara-khan',
        name: 'Zara Khan',
        department: 'Law',
        position: 'Representative',
        about:
          'Wanted academic policies written in plain language, with every council vote recorded for public review.',
        achievements: [
          'Moot court finalist',
          'Legal aid clinic volunteer',
          'Student gazette editor',
        ],
      },
    ],
  },
]

const sessionElections: Election[] = []

export function registerSessionElection(election: Election) {
  const existing = sessionElections.findIndex((item) => item.id === election.id)
  if (existing >= 0) {
    sessionElections[existing] = election
    return
  }

  sessionElections.unshift(election)
}

export function getAllElections() {
  const overlayIds = new Set(sessionElections.map((item) => item.id))
  return [
    ...sessionElections,
    ...elections.filter((item) => !overlayIds.has(item.id)),
  ]
}

export function getElectionById(id: string | undefined) {
  if (!id) {
    return undefined
  }

  return getAllElections().find((election) => election.id === id)
}

export function getElectionByParam(param: string | undefined) {
  if (!param) {
    return undefined
  }

  return (
    getElectionById(param) ??
    getAllElections().find((election) => election.electionCode === param)
  )
}

export function getVerifyPath(election: Election) {
  return `/verify/${election.electionCode}`
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function getCandidateById(election: Election, candidateId: string | null) {
  if (!candidateId) {
    return undefined
  }

  return election.candidates.find((candidate) => candidate.id === candidateId)
}

export function formatVoteCount(count: number) {
  return `${count.toLocaleString('en-US')} votes`
}

export function formatNumber(count: number) {
  return count.toLocaleString('en-US')
}

export function defaultCandidateAchievements(
  department: string,
  position?: string,
) {
  const role = position?.trim() || 'this election'
  return [
    `Standing for ${role}`,
    `Represents ${department}`,
    'Committed to transparent, verifiable elections',
  ]
}

export function getElectionPath(election: Election) {
  if (election.status === 'ended') {
    return `/elections/${election.id}/results`
  }

  return `/elections/${election.id}`
}

export function filterElections(
  items: Election[],
  {
    query,
    status,
    sort,
  }: {
    query: string
    status: 'all' | ElectionStatus
    sort: ElectionSort
  },
) {
  const normalizedQuery = query.trim().toLowerCase()

  const filtered = items.filter((election) => {
    const matchesStatus = status === 'all' || election.status === status
    const matchesQuery =
      normalizedQuery.length === 0 ||
      election.title.toLowerCase().includes(normalizedQuery) ||
      election.description.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesQuery
  })

  if (sort === 'title') {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  }

  if (sort === 'votes') {
    return [...filtered].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0))
  }

  return filtered
}
