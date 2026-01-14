"use client";

import React, { useState } from "react";
import { ClientStage, Client } from "./crmTypes";
import ClientCard from "./ClientCard"; // ⭐ Correctly imports the card

// Define the columns strictly
const COLUMNS: { id: ClientStage; label: string; color: string }[] = [
  { id: "Lead", label: "Leads", color: "border-blue-500" },
  { id: "Discovery", label: "Discovery", color: "border-indigo-500" },
  { id: "Proposal", label: "Proposal", color: "border-purple-500" },
  { id: "Active", label: "Active", color: "border-green-500" },
  { id: "Retention", label: "Retention", color: "border-emerald-500" },
];

interface KanbanBoardProps {
  clients: Client[];
  onMoveClient: (clientId: string, newStage: ClientStage) => void;
}

export default function ClientKanbanBoard({
  clients,
  onMoveClient,
}: KanbanBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<ClientStage | null>(null);

  const getColumnTotal = (stage: ClientStage) => {
    return clients
      .filter((c) => c.stage === stage)
      .reduce((sum, c) => sum + c.contractValue, 0);
  };

  // ⭐ DRAG OVER: Allows the drop
  const handleDragOver = (e: React.DragEvent, colId: ClientStage) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  // ⭐ DROP: Triggers the move action
  const handleDrop = (e: React.DragEvent, colId: ClientStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const clientId = e.dataTransfer.getData("clientId");
    if (clientId) {
      onMoveClient(clientId, colId);
    }
  };

  return (
    <div className="flex h-full gap-4 items-start w-full">
      {COLUMNS.map((col) => {
        const colClients = clients.filter((c) => c.stage === col.id);

        return (
          <div
            key={col.id}
            className={`flex-1 flex flex-col h-full min-w-0 transition-colors rounded-xl ${
              dragOverCol === col.id
                ? "bg-indigo-50/50 ring-2 ring-indigo-200"
                : ""
            }`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
          >
            {/* Column Header */}
            <div
              className={`mb-4 pb-3 border-b-2 ${col.color} bg-gray-50/50 p-3 rounded-t-xl`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-gray-700 text-sm truncate">
                  {col.label}
                </h3>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                  {colClients.length}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium truncate">
                ${getColumnTotal(col.id).toLocaleString()} Potential
              </p>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {colClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}

              {colClients.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs font-medium">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
