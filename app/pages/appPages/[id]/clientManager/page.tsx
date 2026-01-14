"use client";

import React, { useState } from "react";
import { Users, Plus } from "lucide-react";

import TopMenu from "../../components/topMenu/topMenu";
import PipelineStatsRibbon from "../../components/ClientManager/PipelineStatsRibbon";
import ClientKanbanBoard from "../../components/ClientManager/ClientKanbanBoard";
import AddClientModal from "../../components/ClientManager/AddClientModal";

// Import types & initial data
import { CLIENTS_DATA } from "../../components/ClientManager/crmMockData";
import { Client, ClientStage } from "../../components/ClientManager/crmTypes";

export default function ClientManagerPage() {
  // ⭐ STATE: The single source of truth for the entire page
  const [clients, setClients] = useState<Client[]>(CLIENTS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // LOGIC: Move client to new stage
  const moveClient = (clientId: string, newStage: ClientStage) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, stage: newStage } : c))
    );
  };

  // LOGIC: Add new client
  const addClient = (data: any) => {
    const newClient: Client = {
      id: `new-${Date.now()}`,
      name: data.name,
      logo: data.logo,
      stage: data.stage,
      contractValue: data.contractValue,
      currency: "$",
      health: "New",
      sentimentScore: 100,
      lastContact: "Just now",
      nextTask: "Onboarding",
      tags: data.tags,
    };
    setClients([...clients, newClient]);
  };

  return (
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      <div className="flex-shrink-0">
        <TopMenu
          pageName="CRM Pipeline"
          userName="Robert Downey Jr."
          userTier="Agency"
          tokens={2000}
        />
      </div>

      <div className="flex-1 overflow-hidden p-6 lg:p-8 flex flex-col">
        <div className="max-w-[1600px] w-full h-full flex flex-col mx-auto">
          {/* Header */}

          {/* DYNAMIC STATS (Passes state down) */}
          <div className="flex-shrink-0">
            <PipelineStatsRibbon clients={clients} />
          </div>
          <div className="flex-shrink-0 flex items-center justify-between mb-6">
            {/* ⭐ ACTION: Open Modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <Plus size={16} /> Add Client
            </button>
          </div>
          {/* DYNAMIC BOARD (Passes state & handlers down) */}
          <div className="flex-1 min-h-0  mt-4">
            <ClientKanbanBoard clients={clients} onMoveClient={moveClient} />
          </div>
        </div>
      </div>

      {/* MODAL LAYER */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addClient}
      />
    </div>
  );
}
