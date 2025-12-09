"use client"; // <--- Required for useState

import React, { useState } from "react";
import "./profileAnalyzer.css";
import TopMenu from "../../components/topMenu/topMenu";
import Link from "next/link";
import { BsSend } from "react-icons/bs";

export default function Page() {
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <TopMenu
        pageName="Profile Analyzer"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />
      <div className="profileAnalyzerContainer">
        <div className="AnalyerContent">
          <h3>Make Your First Impression Unforgettable</h3>
          <div className="link-input-container">
            <input
              type="text"
              placeholder="Enter Your Link Here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            {/* This button now carries the link to the next page */}
            <Link
              href={
                inputValue
                  ? `/pages/appPages/1/profileAnalyzer/analyzed-account?link=${encodeURIComponent(
                      inputValue
                    )}`
                  : "#"
              }
              className={`send-btn ${
                !inputValue ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <BsSend color="white" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
