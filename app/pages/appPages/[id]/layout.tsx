import React from "react";
import "./layout.css";
import { BsGrid, BsCoin } from "react-icons/bs";

const layout = () => {
  return (
    <div className="appTopContainer">
      <div>
        <div className="appTitle">
          <BsGrid size={20} color="white" className="titleIcon" />

          <h3>Profile Analyzer</h3>
        </div>
      </div>
      <div className="appUserDetails">
        <div>
          <div className="appTockens">
            <BsCoin size={24} />
            <h4>2000</h4>
          </div>
        </div>
        <div className="appUserName">
          <img src="/images/app/pp.jpg" alt="" />
          <div>
            <h3>Robert Downey Jr.</h3>
            <h4>Free Tier</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
