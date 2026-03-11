"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsUpload, BsClipboard, BsCheckCircle, BsX } from "react-icons/bs";
import type { Platform } from "./PlatformSelector";

interface ManualDataEntryProps {
  platform: Platform;
  onSubmit: (data: ManualProfileData) => void;
  onCancel: () => void;
}

export interface ManualProfileData {
  platform: Platform;
  name: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  engagementRate?: number;
  website?: string;
}

const platformFields: Record<
  Platform,
  {
    label: string;
    key: keyof ManualProfileData;
    type: string;
    required: boolean;
  }[]
> = {
  linkedin: [
    { label: "Full Name", key: "name", type: "text", required: true },
    {
      label: "Profile Username",
      key: "username",
      type: "text",
      required: true,
    },
    { label: "Headline / Bio", key: "bio", type: "textarea", required: false },
    {
      label: "Connections/Followers",
      key: "followers",
      type: "number",
      required: true,
    },
    { label: "Following", key: "following", type: "number", required: false },
    { label: "Posts", key: "posts", type: "number", required: false },
  ],
  facebook: [
    { label: "Page/Profile Name", key: "name", type: "text", required: true },
    { label: "Username", key: "username", type: "text", required: true },
    { label: "About", key: "bio", type: "textarea", required: false },
    {
      label: "Page Likes/Followers",
      key: "followers",
      type: "number",
      required: true,
    },
    { label: "Following", key: "following", type: "number", required: false },
    { label: "Total Posts", key: "posts", type: "number", required: false },
  ],
  twitter: [
    { label: "Display Name", key: "name", type: "text", required: true },
    { label: "@Username", key: "username", type: "text", required: true },
    { label: "Bio", key: "bio", type: "textarea", required: false },
    { label: "Followers", key: "followers", type: "number", required: true },
    { label: "Following", key: "following", type: "number", required: false },
    { label: "Tweets", key: "posts", type: "number", required: false },
  ],
  instagram: [
    { label: "Display Name", key: "name", type: "text", required: true },
    { label: "@Username", key: "username", type: "text", required: true },
    { label: "Bio", key: "bio", type: "textarea", required: false },
    { label: "Followers", key: "followers", type: "number", required: true },
    { label: "Following", key: "following", type: "number", required: false },
    { label: "Posts", key: "posts", type: "number", required: false },
  ],
  pinterest: [
    { label: "Display Name", key: "name", type: "text", required: true },
    { label: "Username", key: "username", type: "text", required: true },
    { label: "About", key: "bio", type: "textarea", required: false },
    { label: "Followers", key: "followers", type: "number", required: true },
    { label: "Following", key: "following", type: "number", required: false },
    { label: "Pins", key: "posts", type: "number", required: false },
  ],
};

export function ManualDataEntry({
  platform,
  onSubmit,
  onCancel,
}: ManualDataEntryProps) {
  const [formData, setFormData] = useState<Partial<ManualProfileData>>({
    platform,
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [jsonInput, setJsonInput] = useState("");
  const [inputMode, setInputMode] = useState<"form" | "json">("form");
  const [error, setError] = useState<string | null>(null);

  const fields = platformFields[platform];

  const handleInputChange = (
    key: keyof ManualProfileData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleFormSubmit = () => {
    // Validate required fields
    const missing = fields
      .filter((f) => f.required && !formData[f.key])
      .map((f) => f.label);

    if (missing.length > 0) {
      setError(`Required fields missing: ${missing.join(", ")}`);
      return;
    }

    onSubmit({
      platform,
      name: formData.name || "",
      username: formData.username || "",
      bio: formData.bio || "",
      followers: Number(formData.followers) || 0,
      following: Number(formData.following) || 0,
      posts: Number(formData.posts) || 0,
      engagementRate: formData.engagementRate,
      website: formData.website,
    });
  };

  const handleJsonSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.name || !parsed.followers) {
        setError("JSON must include at least 'name' and 'followers'");
        return;
      }
      onSubmit({
        platform,
        ...parsed,
        followers: Number(parsed.followers) || 0,
        following: Number(parsed.following) || 0,
        posts: Number(parsed.posts) || 0,
      });
    } catch {
      setError("Invalid JSON format");
    }
  };

  return (
    <motion.div
      className="manual-entry-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="manual-entry-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="manual-entry-header">
          <h2>Enter Profile Data Manually</h2>
          <button onClick={onCancel} className="close-btn bg-[#000100] hover:bg-black text-white">
            <BsX size={24} />
          </button>
        </div>

        <div className="manual-entry-tabs">
          <button
            className={`tab ${inputMode === "form" ? "active" : ""}`}
            onClick={() => setInputMode("form")}
          >
            <BsClipboard /> Form Entry
          </button>
          <button
            className={`tab ${inputMode === "json" ? "active" : ""}`}
            onClick={() => setInputMode("json")}
          >
            <BsUpload /> JSON Import
          </button>
        </div>

        <AnimatePresence mode="wait">
          {inputMode === "form" ? (
            <motion.div
              key="form"
              className="manual-entry-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {fields.map((field) => (
                <div key={field.key} className="form-field">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={(formData[field.key] as string) || ""}
                      onChange={(e) =>
                        handleInputChange(field.key, e.target.value)
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        handleInputChange(
                          field.key,
                          field.type === "number"
                            ? e.target.value
                            : e.target.value,
                        )
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="json"
              className="manual-entry-json"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="json-hint">
                Paste JSON data with profile information. Required fields: name,
                followers
              </p>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setError(null);
                }}
                placeholder={`{
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Digital marketer",
  "followers": 5000,
  "following": 500,
  "posts": 120
}`}
                rows={10}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <div className="manual-entry-actions">
          <button onClick={onCancel} className="btn-secondary bg-[#000100] hover:bg-black text-white">
            Cancel
          </button>
          <button
            onClick={inputMode === "form" ? handleFormSubmit : handleJsonSubmit}
            className="btn-primary bg-[#000100] hover:bg-black text-white"
          >
            <BsCheckCircle /> Analyze This Data
          </button>
        </div>
      </motion.div>

      <style jsx>{`
        .manual-entry-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .manual-entry-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .manual-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
        }
        .manual-entry-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 8px;
        }
        .close-btn:hover {
          background: #f0f0f0;
        }
        .manual-entry-tabs {
          display: flex;
          gap: 8px;
          padding: 16px 24px;
          border-bottom: 1px solid #eee;
        }
        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .tab.active {
          background: #0066ff;
          color: white;
          border-color: #0066ff;
        }
        .manual-entry-form,
        .manual-entry-json {
          padding: 24px;
        }
        .form-field {
          margin-bottom: 16px;
        }
        .form-field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #333;
        }
        .required {
          color: #e53e3e;
          margin-left: 2px;
        }
        .form-field input,
        .form-field textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #0066ff;
        }
        .json-hint {
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
        }
        .manual-entry-json textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          resize: vertical;
        }
        .error-message {
          margin: 0 24px 16px;
          padding: 10px 16px;
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 8px;
          font-size: 13px;
        }
        .manual-entry-actions {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #eee;
        }
        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: #f0f0f0;
          border: 1px solid #ddd;
          color: #333;
        }
        .btn-secondary:hover {
          background: #e5e5e5;
        }
        .btn-primary {
          background: #0066ff;
          border: none;
          color: white;
        }
        .btn-primary:hover {
          background: #0052cc;
        }
      `}</style>
    </motion.div>
  );
}

export default ManualDataEntry;
