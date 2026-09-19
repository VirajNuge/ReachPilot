import { LegalPage, type LegalSection } from "../components/guest/LegalPage";

const sections: LegalSection[] = [
  { id: "what", title: "1. What cookies are", paragraphs: ["Cookies and similar technologies are small files or identifiers used to remember preferences, keep sessions secure, understand product usage, and support site functionality."] },
  { id: "use", title: "2. How we use them", paragraphs: ["ReachPilot may use essential cookies for authentication and security, preference cookies for usability, and analytics technologies provided by <span class='placeholder'>[ANALYTICS PROVIDER]</span> if enabled."] },
  { id: "choices", title: "3. Your choices", paragraphs: ["You can control cookies through your browser settings. If a consent banner is enabled, describe its behavior here: <span class='placeholder'>[COOKIE-CONSENT BEHAVIOR]</span>. Disabling essential cookies may prevent parts of ReachPilot from working."] },
  { id: "third-party", title: "4. Third parties", paragraphs: ["Connected social platforms, payment providers, analytics services, and embedded content may use their own technologies. Review their policies for details: <span class='placeholder'>[LIST THIRD-PARTY SERVICES]</span>."] },
  { id: "contact", title: "5. Contact", paragraphs: ["Cookie questions can be sent to <span class='placeholder'>[LEGAL/SUPPORT EMAIL]</span>. Effective date: <span class='placeholder'>[EFFECTIVE DATE]</span>."] },
];

export default function CookiesPage() { return <LegalPage eyebrow="Legal / 03" title="Cookie Policy" intro="A draft explanation of the small technologies that help the site work." sections={sections} />; }
