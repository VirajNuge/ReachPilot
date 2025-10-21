"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../../../components/guestNavBar/guestNavBar";
import style from "./homePage.module.css";
import {
  BsArrowRepeat,
  BsBarChartFill,
  BsCheckCircleFill,
  BsRobot,
  BsStarFill,
  BsXCircleFill,
  BsTelephoneFill,
  BsWhatsapp,
  BsEnvelopeFill,
  BsFacebook,
  BsInstagram,
  BsYoutube,
} from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import Faq from "../../../components/faq/faq";

const homePage = () => {
  const [testimonials] = useState([
    {
      id: 1,
      name: "Kevin L.",
      role: "SaaS Founder",
      feedback:
        "ReachPilot gave me a complete system to manage content and clients. I used to spend hours on outreach — now, the Smart Inbox and CRM save me at least 10 hours a week.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sara P.",
      role: "Marketing Consultant",
      feedback:
        "The AI content suggestions are spot on. I’ve doubled my LinkedIn engagement with half the effort.",
      rating: 5,
    },
    {
      id: 3,
      name: "James R.",
      role: "Agency Owner",
      feedback:
        "It feels like having a 24/7 marketing assistant. Scheduling and client tracking have never been easier.",
      rating: 4,
    },
    {
      id: 4,
      name: "Amira T.",
      role: "Freelance Designer",
      feedback:
        "Beautiful UI and intuitive workflow. The client CRM helps me stay organized and professional.",
      rating: 5,
    },
    {
      id: 5,
      name: "Daniel K.",
      role: "Startup Co-Founder",
      feedback:
        "We integrated ReachPilot into our daily marketing routine. Productivity up by 40% in two weeks!",
      rating: 5,
    },
    {
      id: 6,
      name: "Priya N.",
      role: "Digital Strategist",
      feedback:
        "The analytics dashboard gives me clear visibility into campaign performance — a total game changer.",
      rating: 5,
    },
    {
      id: 7,
      name: "Michael G.",
      role: "Content Creator",
      feedback:
        "I can finally focus on creativity while ReachPilot handles the posting and scheduling automatically.",
      rating: 4,
    },
    {
      id: 8,
      name: "Elena F.",
      role: "Social Media Manager",
      feedback:
        "The Smart Inbox keeps all messages in one place. No more switching tabs and missing client DMs.",
      rating: 5,
    },
    {
      id: 9,
      name: "Robert S.",
      role: "E-Commerce Owner",
      feedback:
        "Automation tools helped us cut response time by 60%. Our customers are happier than ever.",
      rating: 5,
    },
    {
      id: 10,
      name: "Lina C.",
      role: "Personal Brand Coach",
      feedback:
        "I love how the AI rewrites my posts to sound authentic and polished. Engagement skyrocketed!",
      rating: 5,
    },
    {
      id: 11,
      name: "David M.",
      role: "Financial Advisor",
      feedback:
        "Simple, smart, and secure. My clients appreciate how quickly I can respond now.",
      rating: 4,
    },
    {
      id: 12,
      name: "Hassan A.",
      role: "Tech Entrepreneur",
      feedback:
        "ReachPilot saves me from chaos. Everything — content, CRM, insights — in one smooth interface.",
      rating: 5,
    },
    {
      id: 13,
      name: "Emily J.",
      role: "Consultant",
      feedback:
        "The automatic follow-up generator is pure gold. I’ve closed more deals this quarter than ever.",
      rating: 5,
    },
    {
      id: 14,
      name: "Carlos D.",
      role: "Small Business Owner",
      feedback:
        "Affordable and powerful. ReachPilot feels like having a marketing team in my laptop.",
      rating: 5,
    },
    {
      id: 15,
      name: "Yuki M.",
      role: "UX Researcher",
      feedback:
        "The reports are so easy to interpret. My team now uses the insights for every client meeting.",
      rating: 4,
    },
    {
      id: 16,
      name: "Anna V.",
      role: "Freelance Writer",
      feedback:
        "It’s like having Grammarly, Notion, and a CRM merged together — perfectly tailored for creators.",
      rating: 5,
    },
    {
      id: 17,
      name: "Omar S.",
      role: "Growth Hacker",
      feedback:
        "The pipeline automation and AI follow-ups are brilliant. I never forget a lead again.",
      rating: 5,
    },
    {
      id: 18,
      name: "Julia W.",
      role: "HR Consultant",
      feedback:
        "Even my non-tech clients love how simple it is. Makes communication and scheduling painless.",
      rating: 4,
    },
    {
      id: 19,
      name: "Noah P.",
      role: "Digital Marketer",
      feedback:
        "With ReachPilot, my workflow is 3× faster. It feels effortless to keep every client updated.",
      rating: 5,
    },
    {
      id: 20,
      name: "Sophia K.",
      role: "Startup Advisor",
      feedback:
        "ReachPilot’s AI summaries and CRM sync are outstanding. It’s the smartest productivity tool I’ve used.",
      rating: 5,
    },
  ]);

  return (
    <>
      <div className={style.guestpageNavBar}>
        <NavBar />
      </div>
      <div>
        <div>
          <div className={style.heroSectionContainer}>
            <div className={style.heroSectionContainerContent}>
              <div className={style.heroSectionStars}>
                <BsStarFill color="#9546FF" size={16} />{" "}
                <p>4.95 Rated by 2,000+ Users</p>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={style.heroSectionContainerContentTitle}
              >
                Grow Your Brand &<br />
                Close More Deals with AI-Powered
                <br />
                Social Media Tools
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className={style.heroSectionContainerContentSubTitle}
              >
                From profile optimization to post generation, manage your entire
                online
                <br />
                presence in one platform.
              </motion.p>
              <div className={style.heroSectionContainerContentButtons}>
                <button>START FREE TRIAL</button>
                <button>SEE HOW IT WORKS</button>
              </div>
            </div>
            <div className={style.heroSectionDashImage}>
              <img src="/images/dash.png" />
            </div>
          </div>
          <div className={style.featureSection}>
            <div className={style.featureSectionTitle}>
              <div>
                <p className={style.one}>
                  Everything You Need to Grow on Social{" "}
                </p>
                <br />
                <p className={style.two}>In One Platform</p>
              </div>
              <button>SEE HOW IT WORKS →</button>
            </div>
            <div>
              <div className={style.features}>
                <div className={style.featureOne}>
                  <div className={style.featureOneNumTitle}>
                    <p>1</p>
                    <h6>SEE MORE →</h6>
                  </div>
                  <h4>Engagement Analytics</h4>
                  <h5>
                    Track your growth, post performance, and
                    <br />
                    content reach in real time.
                  </h5>
                  <img src="images/homepage/feature1.png" />
                </div>
                <div className={style.featureTwo}>
                  <img src="images/homepage/feature2.png" />

                  <h4>AI Profile Analyzer</h4>
                  <h5>
                    Instantly audit your LinkedIn or Twitter profile with
                    actionable AI suggestions.
                  </h5>
                  <div className={style.featureOneNumTitle}>
                    <p>2</p>
                    <h6>SEE MORE →</h6>
                  </div>
                </div>
                <div className={style.featureTwo}>
                  <img src="images/homepage/feature3.png" />

                  <h4>Advance CRM + Booking</h4>
                  <h5>
                    Let clients book time directly via your content — synced
                    with your calendar.
                  </h5>
                  <div className={style.featureOneNumTitle}>
                    <p>3</p>
                    <h6>SEE MORE →</h6>
                  </div>
                </div>
              </div>
              <br />
              <div className={style.featureFour}>
                <div className={style.featureOneNumTitle}>
                  <p>4</p>
                  <h6>SEE MORE →</h6>
                </div>
                <h4>Social Media Post Generator</h4>
                <h5>
                  Track your growth, post performance,
                  <br />
                  and content reach in real time.
                </h5>
                <img src="images/homepage/feature4.png" />
              </div>
              <div className={style.featuresdown}>
                <div className={style.featureOnee}>
                  <div className={style.featureOneNumTitle}>
                    <p>5</p>
                    <h6>SEE MORE →</h6>
                  </div>
                  <h4>Smart CRM Hub</h4>
                  <h5>
                    Manage your pipeline, communications, and deals
                    <br />— all in one AI-powered workspace.
                  </h5>
                  <div>
                    <div className={style.featureinfoContainer}>
                      <div className={style.featureinfoIcon}>
                        <BsArrowRepeat color="#ffffffff" size={32} />{" "}
                      </div>
                      <div>
                        <h5>PIPELINE AUTOMATION</h5>
                        <p>
                          Auto-move deals across stages when clients reply or
                          schedule a meeting.
                        </p>
                      </div>
                    </div>
                    <div className={style.featureinfoContainer}>
                      <div className={style.featureinfoIcon}>
                        <BsRobot color="#ffffffff" size={32} />{" "}
                      </div>
                      <div>
                        <h5>AI DEAL ASSISTANT</h5>
                        <p>
                          Generate proposals, reminders, and follow-ups based on
                          conversation data.
                        </p>
                      </div>
                    </div>
                    <div className={style.featureinfoContainer}>
                      <div className={style.featureinfoIcon}>
                        <BsBarChartFill color="#ffffffff" size={32} />{" "}
                      </div>
                      <div>
                        <h5>REVENUE INSIGHTS DASHBOARD</h5>
                        <p>
                          Track potential earnings, conversion rates, and deal
                          performance trends. give icons for these react
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={style.featureOnee}>
                  <div className={style.featureOneNumTitle}>
                    <p>1</p>
                    <h6>SEE MORE →</h6>
                  </div>
                  <h4>Unified Command Dashboard</h4>
                  <h5>
                    The dashboard is the control center where users
                    <br />
                    manage everything — from post creation to
                    <br />
                    client outreach.
                  </h5>
                  <br />
                  <div>
                    <div className={style.featureBubbleContainer}>
                      <div className={style.featureBubble}>
                        <p>📊 Profile Health Overview</p>
                      </div>
                      <div className={style.featureBubbleSpace}>
                        <p>✍️ Post Scheduler & Creator</p>
                      </div>
                    </div>
                    <div className={style.featureBubbleContainer}>
                      <div className={style.featureBubbleSpace}>
                        <p>🧠 Lead & CRM Manager</p>
                      </div>
                      <div className={style.featureBubble}>
                        <p>📅 Auto-Booking Panel</p>
                      </div>
                    </div>
                    <div className={style.featureBubbleContainer}>
                      <div className={style.featureBubble}>
                        <p>📨 Inbox & Follow-ups</p>
                      </div>
                      <div className={style.featureBubbleSpace}>
                        <p>🔁 Activity Timeline</p>
                      </div>
                    </div>
                    <div className={style.featureBubbleContainer}>
                      <div className={style.featureBubbleSpace}>
                        <p>🧠 Posts Realtime Insights</p>
                      </div>
                      <div className={style.featureBubble}>
                        <p>✨ AI Suggestions</p>
                      </div>
                    </div>
                    <div className={style.featureBubbleContainer}>
                      <div className={style.featureBubble}>
                        <p>🛠️ Integration & Settings Hub</p>
                      </div>
                      <div className={style.featureBubbleSpace}>
                        <p>🔄 AI Engagement Assistant</p>
                      </div>
                    </div>
                    <div className={style.featureBubbleContainer}>
                      <div className={style.featureBubbleSpace}>
                        <p>🧠 Lead & CRM Manager</p>
                      </div>
                      <div className={style.featureBubble}>
                        <p>📅 Auto-Booking Panel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={style.homeVideoSection}>
        <div className={style.videoText}>
          <h3>HOW IT WORKS?</h3>
          <p>
            From discovery to content to closing clients — watch how our
            all-in-one
            <br />
            dashboard helps you grow smarter and faster.
          </p>
        </div>
        <div className={style.customPlayer}>
          <div className={style.overlay} id="play-btn"></div>
          <iframe
            id="yt-player"
            src="https://www.youtube.com/embed/hNzpEeU3a4I?controls=0"
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className={style.testimonialSection}>
        <div className={style.testimonialText}>
          <h3>
            Trusted by Founders,
            <br />
            Creators & Consultants Worldwide
          </h3>
        </div>

        {/* Left to Right marquee */}
        <div className={style.testimonialAllSectionMarqueeLeft}>
          <div className={style.testimonialAllSection}>
            {testimonials.map((t) => (
              <div key={t.id} className={style.testimonialContainer}>
                <div className={style.testimonialRating}>
                  {[...Array(t.rating)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={style.testimonialRatingInside}
                      color="#9E4DFF"
                    />
                  ))}
                </div>
                <p className={style.testimonialFeedback}>“{t.feedback}”</p>
                <p className={style.testimonialName}>{t.name}</p>
                <span className={style.testimonialRole}>— {t.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right to Left marquee */}
        <div className={style.testimonialAllSectionMarqueeRight}>
          <div className={style.testimonialAllSection}>
            {testimonials.map((t) => (
              <div key={t.id} className={style.testimonialContainer}>
                <div className={style.testimonialRating}>
                  {[...Array(t.rating)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={style.testimonialRatingInside}
                      color="#9E4DFF"
                    />
                  ))}
                </div>
                <p className={style.testimonialFeedback}>“{t.feedback}”</p>
                <p className={style.testimonialName}>{t.name}</p>
                <span className={style.testimonialRole}>— {t.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={style.trustedBySection}>
          <center>
            <h2>WE ARE TRUSTED BY</h2>
            <img src="images/homepage/trusted.png" />
            <p>
              Trusted by{" "}
              <span style={{ color: "#9E4DFF" }}>250+ Companies</span>
            </p>
          </center>
        </div>
      </div>
      <div className={style.pricingSection}>
        <center>
          <h2 className={style.pricingTitle}>PRICING PLANS</h2>
        </center>
        <div className={style.allPricingContainer}>
          <div className={style.pricingContainer}>
            <div className={style.pricingHead}>
              <h2 className={style.pricingTitle}>STARTER</h2>
              <p>Begin your growth journey — free forever</p>
            </div>
            <div className={style.pricingPrice}>
              <p>US$</p>
              <h2>0.00</h2>
              <p>/MO</p>
            </div>
            <h3>+1 month free trial</h3>
            <button>CHOOSE PLAN</button>
            <p className={style.pricingJust}>
              Get 48 months for US$ 143.52 (regular price US$ 575.52). Renews at
              US$ 10.99/mo.
            </p>
            <div className="pricingInclusionsContainer">
              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>10 AI credits/month</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>AI Profile Analyzer (1/month)</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>5 AI Post Generations</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Visual Post Editor (basic templates)</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>3 Inspiration Library saves</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>1 active proposal at a time</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsXCircleFill color="#D8B7FF" size={16} />
                <p>No CRM or Analytics</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsXCircleFill color="#D8B7FF" size={16} />
                <p>No DM automation or cold outreach</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsXCircleFill color="#D8B7FF" size={16} />
                <p>No team features</p>
              </div>
              <div className={style.pricingInclusions}>
                <p>✨ Best for: Personal use, learners, side hustlers</p>
              </div>
            </div>
          </div>
          <div className={style.pricingContainer}>
            <div className={style.pricingHead}>
              <h2 className={style.pricingTitle}>PRO</h2>
              <p>Level up with full access and automation</p>
            </div>
            <div className={style.pricingPrice}>
              <p>US$</p>
              <h2>19.99</h2>
              <p>/MO</p>
            </div>
            <h3>+1 month free trial</h3>
            <button>CHOOSE PLAN</button>
            <p className={style.pricingJust}>
              Get 48 months for US$ 143.52 (regular price US$ 575.52). Renews at
              US$ 10.99/mo.
            </p>
            <div className="pricingInclusionsContainer">
              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>250 AI credits/month</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Unlimited AI Post Generations</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Full Visual AI Editor + Brand Presets</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Smart Inbox + AI DM drafts</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Profile Analyzer (unlimited)</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Client Discovery (10 search/month)</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>CRM + Analytics Dashboard</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>5 active proposals/contracts</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Calendar + Booking System</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Ghostwriter Mode</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Daily Reminders + CRM Flow</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsXCircleFill color="#D8B7FF" size={16} />
                <p>Team collaboration</p>
              </div>
              <div className={style.pricingInclusions}>
                <p>✨ Best for: Freelancers, founders, solo creators</p>
              </div>
            </div>
          </div>
          <div className={style.pricingContainer}>
            <div className={style.pricingHead}>
              <h2 className={style.pricingTitle}>AGENCY</h2>
              <p>Level up with full access and automation</p>
            </div>
            <div className={style.pricingPrice}>
              <p>US$</p>
              <h2>49.99</h2>
              <p>/MO</p>
            </div>
            <h3>+1 month free trial</h3>
            <button>CHOOSE PLAN</button>
            <p className={style.pricingJust}>
              Get 48 months for US$ 143.52 (regular price US$ 575.52). Renews at
              US$ 10.99/mo.
            </p>
            <div className="pricingInclusionsContainer">
              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>1000 AI credits/month</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>All Pro features</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Team CRM + Role Management (5 users)</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Unlimited Client Discovery</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Unlimited Proposal Generator</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>White-label PDF export</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Lead Tracker + Funnel Insights</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Smart Inbox (5 connected accounts)</p>
              </div>

              <div className={style.pricingInclusions}>
                <BsCheckCircleFill color="#9E4DFF" size={16} />
                <p>Priority Support + 1-on-1 onboarding</p>
              </div>
              <div className={style.pricingInclusions}>
                <p>✨ Best for: Agencies, consultants, growth teams</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={style.faqSection}>
        <h2 className={style.pricingTitle}>
          Frequently Asked Questions (FAQs)
        </h2>
        <div>
          <Faq />
        </div>
      </div>
      <div className={style.Footer}>
        <div className={style.FooterText}>
          <h3>ReachPilot</h3>
          <p>
            ReachPilot empowers your social media growth with AI-driven insights
            and pro services — pilot your impact across LinkedIn & Twitter.
          </p>
          <div className={style.FooterIcons}>
            <a href="tel:+123456789" className="social-icon">
              <BsTelephoneFill color="black" />
            </a>
            <a
              href="https://wa.me/123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <BsWhatsapp color="black" />
            </a>
            <a href="mailto:info@reachpilot.com" className="social-icon">
              <BsEnvelopeFill color="black" />
            </a>
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <BsFacebook color="black" />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <BsInstagram color="black" />
            </a>
            <a
              href="https://youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <BsYoutube color="black" />
            </a>
          </div>
          <p>© 2025 ReachPilot. All rights reserved.</p>
        </div>
        <div>
          <h5>Quick Links</h5>
          <p>
            Home
            <br />
            Features
            <br />
            Pricing
            <br />
            About Us
            <br />
            Blog / Resources
            <br />
            Contact
          </p>
        </div>
        <div>
          <h5>Resources</h5>
          <p>
            Help Center / FAQ
            <br />
            Documentation
            <br />
            Tutorials / Guides
            <br />
            API (if applicable)
          </p>
        </div>
        <div>
          <h5>Legal</h5>
          <p>
            Terms of Service
            <br />
            Privacy Policy
            <br />
            Cookie Policy
          </p>
        </div>
      </div>
    </>
  );
};

export default homePage;
