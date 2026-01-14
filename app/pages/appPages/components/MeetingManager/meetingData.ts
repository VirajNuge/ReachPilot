export type MeetingType = "Strategy" | "Check-in" | "Urgent" | "Onboarding";
export type MeetingStatus = "Upcoming" | "Completed" | "Canceled";
export type MeetingPlatform = "Google Meet" | "Zoom"; // ⭐ NEW

export interface Meeting {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: MeetingType;
  status: MeetingStatus;

  platform: MeetingPlatform; // ⭐ NEW
  meetingLink: string; // ⭐ NEW

  aiPrepNote?: string;
  agenda: string[];
  outcome?: string;
}

export const MEETING_DATA: Meeting[] = [
  {
    id: "m1",
    clientId: "c5",
    clientName: "TechFlow Inc.",
    title: "Q4 Roadmap Sync",
    date: "2025-10-24",
    time: "14:00",
    duration: 45,
    type: "Strategy",
    status: "Upcoming",
    platform: "Google Meet", // ⭐
    meetingLink: "meet.google.com/abc-defg-hij", // ⭐
    aiPrepNote:
      "⚡ Insight: TechFlow just raised Series B. Mention 'Scaling Ops'.",
    agenda: [
      "Review Q3 KPIs",
      "Approve Holiday Budget",
      "Tech Integration discussion",
    ],
  },
  {
    id: "m2",
    clientId: "c3",
    clientName: "Urban Coffee",
    title: "Content Approval",
    date: "2025-10-24",
    time: "16:30",
    duration: 30,
    type: "Check-in",
    status: "Upcoming",
    platform: "Zoom", // ⭐
    meetingLink: "zoom.us/j/987654321", // ⭐
    aiPrepNote:
      "⚠️ Alert: Last 2 posts had low engagement. Pitch a 'Reel' strategy.",
    agenda: ["Approve Next Week's Posts", "Discuss Influencer Collab"],
  },
  // ... (keep other data)
];
