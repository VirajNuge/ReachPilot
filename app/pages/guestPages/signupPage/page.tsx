import React from "react";
import Link from "next/link";
import "./signupPage.css";

const SignupPage = () => {
  return (
    <div className="loginPageFlex">
      <div className="loginContainer">
        <div className="loginLogo">
          <img src="/images/logo.svg" alt="ReachPilot logo" />
          <h2>ReachPilot</h2>
        </div>

        <div className="loginDetails">
          <h3>Signup Here</h3>
          <div className="loginInputs">
            <div className="signleLoginInput">
              <label htmlFor="uname">Username</label>
              <br />
              <input type="text" id="uname" />
            </div>

            <div className="signleLoginInput">
              <label htmlFor="fname">First Name</label>
              <br />
              <input type="text" id="fname" />
            </div>

            <div className="signleLoginInput">
              <label htmlFor="lname">Second Name</label>
              <br />
              <input type="text" id="lname" />
            </div>

            <div className="signleLoginInput">
              <label htmlFor="email">Email</label>
              <br />
              <input type="email" id="email" />
            </div>

            <div className="signleLoginInput">
              <label htmlFor="password">Password</label>
              <br />
              <input type="password" id="password" />
            </div>

            <div>
              <label className="flex items-center gap-2 mt-4 font-medium">
                <input
                  type="radio"
                  name="terms"
                  value="yes"
                  className="accent-purple-600"
                />
                I agree to terms & conditions
              </label>
            </div>
          </div>

          <button className="loginButton">Signup</button>
          <Link href="/pages/guestPages/loginPage" className="loginPassForgot">
            I have an account
          </Link>
        </div>
      </div>

      <div className="loginImage">
        <img src="/images/signBg.png" alt="Login background" />
      </div>
    </div>
  );
};

export default SignupPage;
