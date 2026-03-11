"use client";

import React, { useState } from "react";
import { X, Briefcase, DollarSign, Image as ImageIcon } from "lucide-react";
import { ClientStage } from "./crmTypes";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (clientData: any) => void;
}

export default function AddClientModal({
  isOpen,
  onClose,
  onAdd,
}: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    contractValue: "",
    stage: "Lead" as ClientStage,
    tags: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      contractValue: Number(formData.contractValue),
      tags: formData.tags.split(",").map((t) => t.trim()), // Convert "SaaS, Tech" to array
    });
    onClose();
    // Reset form
    setFormData({
      name: "",
      logo: "",
      contractValue: "",
      stage: "Lead",
      tags: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Add New Client</h3>
          <button
            onClick={onClose}
            className="bg-[#000100] hover:bg-black text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Client Name
            </label>
            <div className="relative">
              <Briefcase
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="e.g. Acme Corp"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Contract Value ($)
            </label>
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="number"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="2500"
                value={formData.contractValue}
                onChange={(e) =>
                  setFormData({ ...formData, contractValue: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Logo Initials
            </label>
            <div className="relative">
              <ImageIcon
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                maxLength={2}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none uppercase"
                placeholder="AC"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="SaaS, High Ticket..."
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold transition-all mt-4 bg-[#000100] hover:bg-black text-white"
          >
            Create Client
          </button>
        </form>
      </div>
    </div>
  );
}
