import React from "react";
import "./profileAnalyzer.css";
import TopMenu from "../../components/topMenu/topMenu";
import Link from "next/link";
import { BsSend } from "react-icons/bs";

export default function Page() {
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
            <input type="text" placeholder="Enter Your Link Here" />
            <Link href="/send" className="send-btn">
              <BsSend color="white" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
