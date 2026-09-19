import { BarChart3, BrainCircuit, CalendarClock, FileText, Inbox, UsersRound } from "lucide-react";
import { GuestShell, PageHero, Reveal, SectionIntro, ArrowLink } from "../components/guest/GuestShell";
import styles from "../components/guest/public-pages.module.css";

const services = [
  [BrainCircuit, "Profile Analyzer", "See the clearest opportunities in your positioning, profile, audience, and content direction."],
  [FileText, "AI Content Studio", "Move from a blank page to useful ideas, hooks, drafts, and iterations that still sound like you."],
  [BarChart3, "Growth Analytics", "Connect performance signals to decisions with a calmer view of what is actually changing."],
  [UsersRound, "Client Workspace", "Organize people, opportunities, notes, and follow-ups around the relationships that matter."],
  [CalendarClock, "Publishing Workflow", "Plan, schedule, and review your content rhythm without losing the thinking behind it."],
  [Inbox, "Smart Inbox", "Keep conversations and next actions visible so warm opportunities do not disappear into tabs."],
] as const;

export default function ServicesPage() {
  return <GuestShell><PageHero eyebrow="The ReachPilot system" title="Everything that helps good work travel further." body="ReachPilot brings profile intelligence, content thinking, analytics, and client momentum into one focused workspace." /><div className={styles.content}><div className={styles.grid}>{services.map(([Icon, title, body], index) => <Reveal key={title} delay={index * .05} className={styles.card}><Icon size={24} /><h2>{title}</h2><p>{body}</p></Reveal>)}</div><div style={{ marginTop: 16 }} className={styles.largeGrid}><div className={styles.darkCard}><span className={styles.eyebrow}>A connected point of view</span><h2>Better content starts with better context.</h2><p>Your profile, audience, content, and client work do not live in separate worlds. ReachPilot helps you see the connection and make the next decision with more confidence.</p><div style={{ marginTop: 28 }}><ArrowLink href="/signup">Start with an access code</ArrowLink></div></div><div className={styles.lightCard}><BarChart3 size={24} color="#8245e4" /><h2>Built around signal, not noise.</h2><p>Every surface is designed to turn information into a useful action: a clearer profile, a stronger post, a smarter follow-up, or a better weekly rhythm.</p></div></div></div></GuestShell>;
}
