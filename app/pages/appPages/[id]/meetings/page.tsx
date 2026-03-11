"use client";
import React, { useState } from "react";
import {
  Calendar as CalIcon,
  History,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";
import TopMenu from "../../components/topMenu/topMenu";
import MeetingSidebar from "../../components/MeetingManager/MeetingSidebar";
import BookingModal from "../../components/MeetingManager/BookingModal";
import {
  MEETING_DATA,
  Meeting,
  MeetingPlatform,
} from "../../components/MeetingManager/meetingData";

export default function MeetingPage() {
  // ... (State logic same as before)
  const [activeTab, setActiveTab] = useState<"calendar" | "history">(
    "calendar"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>(MEETING_DATA);

  const upcomingMeetings = meetings
    .filter((m) => m.status === "Upcoming")
    .sort((a, b) => a.time.localeCompare(b.time));
  const pastMeetings = meetings.filter(
    (m) => m.status === "Completed" || m.status === "Canceled"
  );

  // ⭐ UPDATE: Handle Adding Meeting with Platform Logic
  const handleAddMeeting = (data: any) => {
    // Generate Mock Link based on Platform
    const mockLink =
      data.platform === "Zoom"
        ? `zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
        : `meet.google.com/${Math.random().toString(36).substring(7)}`;

    const newMeeting: Meeting = {
      id: Math.random().toString(),
      clientId: "c99",
      clientName: data.client || "New Client",
      title: `${data.type} Session`,
      date: "2025-10-25",
      time: "10:00",
      duration: 30,
      type: data.type,
      status: "Upcoming",
      platform: data.platform as MeetingPlatform, // ⭐
      meetingLink: mockLink, // ⭐
      agenda: data.agenda ? data.agenda.split("\n") : [],
    };
    setMeetings([...meetings, newMeeting]);
  };

  return (
    // ... (Keep the exact same JSX return as the previous response)
    // The previous page.tsx layout was correct, just ensure this handleAddMeeting logic replaces the old one.
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      <div className="flex-shrink-0">
        <TopMenu
          pageName="Meetings"
          tokens={2000}
        />
      </div>
      <div className="flex-1 overflow-hidden flex">
        <MeetingSidebar upcoming={upcomingMeetings} />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Meeting Command Center
              </h1>
              <p className="text-sm text-gray-500">
                Manage strategy sessions and client syncs.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === "calendar"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CalIcon size={14} /> Calendar
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === "history"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <History size={14} /> History Log
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus size={16} /> Book Meeting
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
            {/* ... (Keep Calendar and History views same as previous) ... */}
            {/* If you need the calendar code again, refer to the previous message or ask me to reprint it! */}
            {activeTab === "calendar" && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      October 2025
                    </h2>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded-md">
                        <ChevronLeft size={18} className="text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded-md">
                        <ChevronRight size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}
                      Strategy
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>{" "}
                      Urgent
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>{" "}
                      Routine
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d}
                        className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-400 uppercase"
                      >
                        {d}
                      </div>
                    )
                  )}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2;
                    const isToday = day === 24;
                    const daysMeetings = meetings.filter(
                      (m) => m.date === `2025-10-${day}`
                    );
                    return (
                      <div
                        key={i}
                        className={`bg-white min-h-[120px] p-2 hover:bg-gray-50 transition-colors relative group ${
                          day < 1 || day > 31 ? "bg-gray-50/50" : ""
                        }`}
                      >
                        {day > 0 && day <= 31 && (
                          <>
                            <span
                              className={`text-xs font-bold ${
                                isToday
                                  ? "bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full"
                                  : "text-gray-700"
                              }`}
                            >
                              {day}
                            </span>
                            <div className="mt-2 space-y-1.5">
                              {daysMeetings.map((m) => (
                                <div
                                  key={m.id}
                                  className={`p-1.5 rounded-md text-[10px] font-bold truncate border-l-2 cursor-pointer hover:scale-105 transition-transform ${
                                    m.type === "Strategy"
                                      ? "bg-blue-50 text-blue-700 border-blue-500"
                                      : m.type === "Urgent"
                                      ? "bg-red-50 text-red-700 border-red-500"
                                      : "bg-gray-100 text-gray-700 border-gray-400"
                                  }`}
                                >
                                  {m.time} {m.clientName}
                                </div>
                              ))}
                            </div>
                            <button className="absolute bottom-2 right-2 p-1 bg-indigo-50 text-indigo-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === "history" && (
              <div className="animate-in fade-in slide-in-from-right-2">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <FileText size={18} /> Past Sessions
                    </h3>
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-2.5 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase bg-gray-50/30">
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">Client</th>
                        <th className="p-4 font-bold">Type</th>
                        <th className="p-4 font-bold">Outcome Note</th>
                        <th className="p-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {pastMeetings.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="p-4 font-bold text-gray-700">
                            {m.date}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-900">
                              {m.clientName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {m.title}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                              {m.type}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 italic max-w-xs truncate">
                            {m.outcome || "No notes recorded."}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBook={handleAddMeeting}
      />
    </div>
  );
}
