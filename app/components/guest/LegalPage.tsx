import { GuestShell, PageHero } from "./GuestShell";
import styles from "./public-pages.module.css";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export function LegalPage({ title, eyebrow, intro, sections }: { title: string; eyebrow: string; intro: string; sections: LegalSection[] }) {
  return <GuestShell><PageHero eyebrow={eyebrow} title={title} body={intro} /><div className={styles.legalLayout}><aside className={styles.legalAside} aria-label="Policy sections">{sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</aside><article className={styles.legalBody}><div className={styles.legalMeta}><strong>Draft for review.</strong> Replace the highlighted placeholders with your legal business details and have this document reviewed before launch. Effective date: <span className={styles.placeholder}>[EFFECTIVE DATE]</span>. Last updated: <span className={styles.placeholder}>[LAST UPDATED]</span>.</div>{sections.map(section => <section className={styles.legalSection} id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />)}{section.bullets && <ul>{section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}</article></div></GuestShell>;
}
