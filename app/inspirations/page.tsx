import { ArrowUpRight, Lightbulb, MessageCircle, PenLine, Target } from "lucide-react";
import { GuestShell, PageHero, Reveal, ArrowLink } from "../components/guest/GuestShell";
import styles from "../components/guest/public-pages.module.css";

const ideas = [
  ["The useful lesson", "Turn a recent mistake into a small, specific lesson someone can use today."],
  ["The point of view", "Name the thing your audience feels but has not yet put into words."],
  ["The behind-the-scenes", "Show the decision, constraint, or tradeoff behind the polished outcome."],
  ["The practical teardown", "Take apart a familiar process and explain what you would keep or change."],
];

export default function InspirationsPage() {
  return <GuestShell><PageHero eyebrow="Inspiration, with intent" title="Good ideas are easier to find when you know what to look for." body="Use ReachPilot to turn audience signals, working notes, and real experience into content directions with a point of view." /><div className={styles.content}><div className={styles.grid}>{ideas.map(([title, body], index) => <Reveal key={title} delay={index * .07} className={styles.card}><span style={{ color: "#8b4dff", fontSize: 10, fontWeight: 900 }}>PROMPT 0{index + 1}</span><h2>{title}</h2><p>{body}</p><div style={{ marginTop: 22 }}><ArrowLink href="/signup">Use this direction</ArrowLink></div></Reveal>)}</div><div style={{ marginTop: 16 }} className={styles.largeGrid}><div className={styles.lightCard}><Lightbulb size={24} color="#8245e4" /><h2>Start from a signal.</h2><p>ReachPilot’s analyzer and content tools help you move from “I should post something” to a specific, audience-aware direction.</p></div><div className={styles.darkCard}><span className={styles.eyebrow}>Your creative loop</span><h2>Notice. Shape. Share. Learn.</h2><p>Make your content practice easier to repeat, so your best thinking has more chances to travel.</p><div style={{ display: "flex", gap: 17, marginTop: 28, color: "#d8baff" }}><PenLine size={18} /><MessageCircle size={18} /><Target size={18} /><ArrowUpRight size={18} /></div></div></div><div style={{ marginTop: 70 }} className={styles.quote}><p>“The best content usually starts as a useful observation you almost kept to yourself.”</p><small>ReachPilot creative principle</small></div></div></GuestShell>;
}
