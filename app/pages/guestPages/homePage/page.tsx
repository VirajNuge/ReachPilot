"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  Check,
  ChevronRight,
  CircleUserRound,
  FileText,
  Inbox,
  LineChart,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Faq from "../../../components/faq/faq";
import { ArrowLink, GuestShell, Reveal, SectionIntro } from "../../../components/guest/GuestShell";
import styles from "./homePage.module.css";

const capabilities = [
  { icon: CircleUserRound, label: "01 / Understand", title: "A sharper read on your profile.", body: "Turn your profile and audience signals into a practical growth brief with clear next moves.", tone: "lavender" },
  { icon: Sparkles, label: "02 / Create", title: "Ideas that sound like you.", body: "Build stronger posts, hooks, and content directions without losing your point of view.", tone: "peach" },
  { icon: BarChart3, label: "03 / Improve", title: "Feedback you can act on.", body: "See what is resonating, compare patterns, and use performance data to guide your next post.", tone: "blue" },
  { icon: UsersRound, label: "04 / Convert", title: "Keep opportunities moving.", body: "Organize relationships, client work, and follow-ups in a workspace built around momentum.", tone: "green" },
];

const plans = [
  { name: "Starter", price: "$0", description: "A focused starting point for exploring your growth system.", features: ["10 AI credits / month", "Profile analyzer", "Basic post ideas", "Starter inspiration library"] },
  { name: "Pro", price: "$19.99", description: "The complete toolkit for consistent personal-brand growth.", features: ["250 AI credits / month", "Advanced content analysis", "Smart inbox and drafts", "CRM and analytics workspace"], featured: true },
  { name: "Agency", price: "$49.99", description: "A multi-client workspace for teams that need more range.", features: ["1,000 AI credits / month", "Team CRM and roles", "Unlimited client discovery", "Priority onboarding"] },
];

function DashboardPreview() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={styles.dashboardStage} initial={false} animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <div className={styles.dashboardGlow} />
        <motion.div className={styles.dashboardFrame} animate={reduceMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <div className={styles.dashboardTopbar}><span><i /> ReachPilot workspace</span><span className={styles.liveBadge}>Live overview</span></div>
        <div className={styles.dashboardBody}>
          <aside><div className={styles.miniLogo}>R</div>{[BarChart3, BrainCircuit, FileText, Inbox, CalendarClock].map((Icon, index) => <span className={index === 0 ? styles.activeSideIcon : ""} key={index}><Icon size={14} /></span>)}</aside>
          <div className={styles.dashboardContent}>
            <div className={styles.previewHeading}><div><small>Monday, your signal is clear</small><strong>Good morning, creator.</strong></div><span className={styles.avatar}>VN</span></div>
            <div className={styles.previewMetrics}><div><small>Profile health</small><strong>86<span>/100</span></strong><em>+12.4%</em></div><div><small>Content signal</small><strong>Strong</strong><em>3 themes ready</em></div><div><small>Next opportunity</small><strong>Today</strong><em>2 follow-ups</em></div></div>
            <div className={styles.previewGrid}>
              <div className={styles.chartCard}><div className={styles.cardTitle}><span>Audience momentum</span><small>Last 30 days <ChevronRight size={12} /></small></div><div className={styles.chartArea}><svg viewBox="0 0 420 145" role="img" aria-label="Audience momentum trending upward"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9d5cff" stopOpacity=".33" /><stop offset="1" stopColor="#9d5cff" stopOpacity="0" /></linearGradient></defs><path d="M0 126 C38 114, 52 120, 81 103 S124 111, 152 82 S195 88, 225 72 S265 74, 291 49 S330 60, 355 30 S395 42, 420 8 L420 145 L0 145Z" fill="url(#chartFill)" /><path d="M0 126 C38 114, 52 120, 81 103 S124 111, 152 82 S195 88, 225 72 S265 74, 291 49 S330 60, 355 30 S395 42, 420 8" fill="none" stroke="#884bfa" strokeWidth="3" strokeLinecap="round" /></svg></div></div>
              <div className={styles.signalCard}><div className={styles.cardTitle}><span>Content signal</span><Sparkles size={13} /></div><div className={styles.signalRing}><strong>78%</strong><small>clear direction</small></div><div className={styles.signalBar}><i style={{ width: "78%" }} /></div><p>Your audience is responding to practical, behind-the-scenes lessons.</p></div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div className={styles.floatingNote} animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, 1, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><span><Sparkles size={14} /></span><div><small>AI suggestion</small><strong>Make the insight useful.</strong></div></motion.div>
      <motion.div className={styles.floatingScore} animate={reduceMotion ? undefined : { y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}><LineChart size={15} /><span><strong>+24.8%</strong><small>growth signal</small></span></motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  return <GuestShell><main>
    <section className={styles.hero}><div className={styles.heroOrb} /><div className={styles.heroGrid} /><div className={styles.heroInner}>
      <div className={styles.heroCopy}>
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className={styles.heroEyebrow}><span><Sparkles size={13} /> Creator intelligence, in one place</span></motion.div>
        <motion.h1 initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}>Make your next move <em>obvious.</em></motion.h1>
        <motion.p initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }}>ReachPilot turns audience signals into clearer content, stronger relationships, and a growth workflow you can actually keep up with.</motion.p>
        <motion.div className={styles.buttonRow} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24 }}><Link href="/signup" className={`${styles.primaryButton} ${styles.heroButton}`}>Create your account <ArrowUpRight size={16} /></Link><Link href="/services" className={styles.heroTextLink}>Explore the platform <ArrowUpRight size={15} /></Link></motion.div>
        <motion.div className={styles.heroProof} initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.55 }}><div className={styles.proofAvatars}><span>R</span><span>A</span><span>M</span><span>+</span></div><p>Built for thoughtful creators, consultants, and teams who want momentum without the noise.</p></motion.div>
      </div><DashboardPreview />
    </div></section>
    <section className={styles.signalStrip}><div><span className={styles.signalIcon}><CircleUserRound size={17} /></span><strong>Profile intelligence</strong><small>Know what to fix next</small></div><div><span className={styles.signalIcon}><Sparkles size={17} /></span><strong>Content direction</strong><small>Make ideas easier to ship</small></div><div><span className={styles.signalIcon}><BarChart3 size={17} /></span><strong>Growth feedback</strong><small>Learn from every signal</small></div><div><span className={styles.signalIcon}><UsersRound size={17} /></span><strong>Client momentum</strong><small>Keep the right work moving</small></div></section>
    <section className={styles.section}><SectionIntro eyebrow="One connected system" title="From scattered signals to a clearer path forward." body="ReachPilot gives your ideas, audience, content, and client work a shared home—so each action builds on the last." /><div className={styles.capabilityGrid}>{capabilities.map((item, index) => { const Icon = item.icon; return <Reveal key={item.title} delay={index * 0.06} className={`${styles.capabilityCard} ${styles[item.tone]}`}><div className={styles.cardTop}><span>{item.label}</span><Icon size={20} /></div><h3>{item.title}</h3><p>{item.body}</p><ArrowLink href="/services">Explore capability</ArrowLink></Reveal>; })}</div></section>
    <section className={`${styles.section} ${styles.showcaseSection}`}><div className={styles.showcaseCopy}><SectionIntro eyebrow="Less guesswork" title="A workspace that keeps the signal close." body="See the health of your profile, the shape of your content, and the opportunities in front of you without stitching together five different tools." /><div className={styles.featureList}><div><span><Check size={15} /></span><p><strong>See the story behind the metric.</strong> Translate performance into useful creative direction.</p></div><div><span><Check size={15} /></span><p><strong>Keep your voice in the room.</strong> Use AI as a thinking partner, not a replacement for taste.</p></div><div><span><Check size={15} /></span><p><strong>Make follow-through easier.</strong> Move from insight to draft, schedule, and next step.</p></div></div><ArrowLink href="/services">See everything ReachPilot can do</ArrowLink></div><Reveal className={styles.assetCard}><div className={styles.assetCardHeader}><span><i /> Product intelligence</span><small>01 / 03</small></div><Image src="/images/homepage/feature41.png" alt="ReachPilot product analytics preview" width={800} height={650} className={styles.featureImage} /><div className={styles.assetCardFooter}><strong>Know your signal.</strong><span>Profile + content + audience</span></div></Reveal></section>
    <section className={`${styles.section} ${styles.workflowSection}`}><SectionIntro eyebrow="A calmer workflow" title="Four steps from signal to momentum." align="center" /><div className={styles.workflowGrid}>{[{ number: "01", icon: CircleUserRound, title: "Connect", body: "Bring your profile and the context behind your work." }, { number: "02", icon: BrainCircuit, title: "Understand", body: "Find patterns in your audience, positioning, and content." }, { number: "03", icon: FileText, title: "Create", body: "Turn good insight into a post, plan, or next conversation." }, { number: "04", icon: LineChart, title: "Grow", body: "Track what changes and keep building from evidence." }].map((step, index) => { const Icon = step.icon; return <Reveal key={step.number} delay={index * 0.07} className={styles.workflowStep}><span className={styles.stepNumber}>{step.number}</span><Icon size={21} /><h3>{step.title}</h3><p>{step.body}</p>{index < 3 && <span className={styles.workflowArrow}><ChevronRight size={16} /></span>}</Reveal>; })}</div></section>
    <section className={styles.darkBand}><Reveal className={styles.darkBandInner}><div><span className={styles.eyebrow}>Made for the work behind the post</span><h2>Your audience is already telling you something.</h2><p>ReachPilot helps you hear it, shape it, and act on it while the opportunity is still warm.</p></div><Link href="/signup" className={styles.lightButton}>Start with an access code <ArrowUpRight size={16} /></Link></Reveal></section>
    <section className={styles.section}><SectionIntro eyebrow="Choose your runway" title="Start with the level of support you need." body="Plans are structured around how much of your growth workflow you want to bring into one place." align="center" /><div className={styles.planGrid}>{plans.map((plan) => <div key={plan.name} className={`${styles.planCard} ${plan.featured ? styles.featuredPlan : ""}`}>{plan.featured && <span className={styles.planBadge}>Most complete</span>}<span className={styles.planName}>{plan.name}</span><div className={styles.planPrice}>{plan.price}<small>/month</small></div><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><Link href="/pricing" className={plan.featured ? styles.primaryButton : styles.secondaryButton}>View plan <ArrowUpRight size={14} /></Link></div>)}</div></section>
    <section className={styles.faqSection}><SectionIntro eyebrow="Questions, answered" title="The short version." body="A few useful answers before you start." /><Faq /></section>
    <section className={styles.finalCta}><span className={styles.eyebrow}>Your next move starts here</span><h2>Build a growth system with a point of view.</h2><p>ReachPilot is invite-only while we build with the people who care about doing the work well.</p><Link href="/signup" className={styles.primaryButton}>Create your account <ArrowUpRight size={16} /></Link></section>
  </main></GuestShell>;
}
