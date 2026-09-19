"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./guest.module.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Inspirations", href: "/inspirations" },
  { label: "Contact", href: "/contact" },
];

export function GuestNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.navWrap}>
      <div className={styles.navbar}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <span className={styles.brandMark} aria-hidden="true">
            <Image src="/images/logo.svg" alt="" width={22} height={22} />
          </span>
          <span>
            <strong>ReachPilot</strong>
            <small>Creator intelligence</small>
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? styles.activeNav : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>
            Log in
          </Link>
          <Link href="/signup" className={styles.navCta}>
            Get access <span aria-hidden="true">↗</span>
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            className={styles.mobileNav}
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className={styles.mobileActions}>
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" className={styles.navCta} onClick={() => setOpen(false)}>
                Get access <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function GuestFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <Image src="/images/logo.svg" alt="" width={22} height={22} />
            </span>
            <span>
              <strong>ReachPilot</strong>
              <small>Creator intelligence</small>
            </span>
          </Link>
          <p>Turn audience signals into sharper content, stronger relationships, and measurable growth.</p>
        </div>
        <div className={styles.footerColumn}>
          <span>Explore</span>
          <Link href="/services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/inspirations">Inspirations</Link>
        </div>
        <div className={styles.footerColumn}>
          <span>Company</span>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Get access</Link>
        </div>
        <div className={styles.footerColumn}>
          <span>Legal</span>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} ReachPilot. All rights reserved.</span>
        <span>Built for people with something worth saying.</span>
      </div>
    </footer>
  );
}

export function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      <GuestNav />
      {children}
      <GuestFooter />
    </div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`${styles.sectionIntro} ${align === "center" ? styles.centerIntro : ""}`}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className={styles.pageHero}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.arrowLink}>
      {children} <span aria-hidden="true">↗</span>
    </Link>
  );
}
