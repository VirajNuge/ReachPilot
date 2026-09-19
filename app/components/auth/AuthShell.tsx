import Image from "next/image";
import Link from "next/link";
import styles from "./auth.module.css";

export function AuthShell({ children, eyebrow = "Private workspace" }: { children: React.ReactNode; eyebrow?: string }) {
  return <main className={styles.authPage}><div className={styles.authBackdrop} /><div className={styles.authLayout}><div className={styles.authStory}><Link href="/" className={styles.authBrand}><span><Image src="/images/logo.svg" alt="" width={22} height={22} /></span><strong>ReachPilot</strong></Link><div className={styles.storyCopy}><span className={styles.storyEyebrow}>{eyebrow}</span><h1>A calmer way to make your next move.</h1><p>Bring your profile, content, audience, and opportunities into one focused workspace built for thoughtful growth.</p></div><div className={styles.storyFooter}><span>AI-assisted. Human-led.</span><span>ReachPilot / 2026</span></div></div><div className={styles.authPanel}>{children}</div></div></main>;
}

export function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className={styles.authCard}><div className={styles.cardHeading}><span className={styles.cardEyebrow}>ReachPilot access</span><h2>{title}</h2><p>{description}</p></div>{children}</div>;
}

export function AuthMessage({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  return <div className={`${styles.message} ${type === "error" ? styles.error : styles.success}`} role={type === "error" ? "alert" : "status"}>{children}</div>;
}

export function AuthField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={styles.field}><span>{label}</span><input {...props} /></label>;
}

export { styles as authStyles };
