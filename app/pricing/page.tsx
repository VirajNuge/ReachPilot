import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { GuestShell, PageHero, Reveal } from "../components/guest/GuestShell";
import styles from "../components/guest/public-pages.module.css";

const plans = [
  { name: "Starter", price: "$0", copy: "Begin with the essentials.", features: ["10 AI credits / month", "Profile Analyzer", "AI concept proposals", "Basic visual editor", "Inspiration saves"] },
  { name: "Pro", price: "$19.99", copy: "For consistent growth work.", featured: true, features: ["250 AI credits / month", "Advanced content analysis", "Full visual AI editor", "Smart inbox and AI drafts", "CRM and analytics dashboard", "Calendar and booking system"] },
  { name: "Agency", price: "$49.99", copy: "For teams with more range.", features: ["1,000 AI credits / month", "All Pro features", "Team CRM and role management", "Unlimited client discovery", "White-label PDF export", "Priority support and onboarding"] },
];

export default function PricingPage() {
  return <GuestShell><PageHero eyebrow="Simple runways" title="Choose the amount of momentum you want to manage." body="Start with the essentials, then bring more of your content and client workflow into ReachPilot as your work grows." /><div className={styles.content}><div className={styles.grid}>{plans.map((plan, index) => <Reveal key={plan.name} delay={index * .08} className={`${styles.card} ${plan.featured ? styles.darkCard : ""}`}><span className={styles.eyebrow}>{plan.name}</span><h2>{plan.price}<small style={{ fontSize: 11, marginLeft: 5, color: plan.featured ? "#b9a9c5" : "#9c8fac" }}>/ month</small></h2><p>{plan.copy}</p><ul style={{ display: "grid", gap: 12, margin: "25px 0", padding: 0, listStyle: "none" }}>{plan.features.map(feature => <li key={feature} style={{ display: "flex", gap: 8, color: plan.featured ? "#ded4e5" : "#766a82", fontSize: 12 }}><Check size={15} color="#9a5cff" />{feature}</li>)}</ul><Link href="/signup" className={plan.featured ? styles.primaryButton : styles.secondaryButton}>Choose {plan.name} <ArrowUpRight size={14} /></Link></Reveal>)}</div><div style={{ marginTop: 70 }} className={styles.comparison}><div className={styles.comparisonHeader}><span>Capability</span><span>Starter</span><span>Pro</span><span>Agency</span></div>{["Profile intelligence", "AI content workflow", "Analytics", "Client workspace", "Team collaboration"].map(item => <div className={styles.comparisonRow} key={item}><strong>{item}</strong><span><Check size={14} /></span><span><Check size={14} /></span><span><Check size={14} /></span></div>)}</div></div></GuestShell>;
}
