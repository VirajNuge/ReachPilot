import React from "react";
import "./loginPage.css";

const loginPage = () => {
  return (
    <>
      <div className="loginPageFlex">
        <div className="loginContainer">
          <div className="loginLogo">
            <img src="/images/logo.svg" />
            <h2>ReachPilot</h2>
          </div>
          <div className="loginDetails">
            <h3>Login Here</h3>
            <div className="loginInputs">
              <div className="signleLoginInput">
                <label>Username</label>
                <br />
                <input type="text" id="fname"></input>
              </div>
              <div className="signleLoginInput">
                <label>Password</label>
                <br />
                <input type="password" id="password"></input>
              </div>
              <div>
                <label className="flex items-center gap-2 mt-4 font-medium">
                  <input
                    type="radio"
                    name="option"
                    value="yes"
                    className="accent-purple-600"
                  />
                  Remember Me
                </label>
              </div>
            </div>
            <button className="loginButton">Login</button>
            <a className="loginPassForgot">Forgot Password</a>
          </div>
        </div>
        <div className="loginImage">
          <img src="/images/logBg.png" />
        </div>
      </div>
    </>
  );
};

export default loginPage;
