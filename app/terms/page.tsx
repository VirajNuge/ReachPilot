import { LegalPage, type LegalSection } from "../components/guest/LegalPage";

const sections: LegalSection[] = [
  { id: "agreement", title: "1. Agreement", paragraphs: ["These draft Terms of Service govern your use of ReachPilot, operated by <span class='placeholder'>[LEGAL BUSINESS NAME]</span> at <span class='placeholder'>[BUSINESS ADDRESS]</span>. By using the service, you agree to these terms and any policies linked from them."] },
  { id: "eligibility", title: "2. Eligibility and access", paragraphs: ["You must provide accurate account information and keep your login credentials secure. ReachPilot is currently invite-only; access codes are provided by the ReachPilot owner and may be rotated or revoked.", "You are responsible for activity performed through your account and for ensuring that your use of connected social platforms follows their terms."] },
  { id: "acceptable-use", title: "3. Acceptable use", paragraphs: ["You may not use ReachPilot to violate law, platform rules, privacy rights, intellectual-property rights, or the rights of other people. Do not attempt to interfere with the service, bypass access controls, or use generated content in a misleading or harmful way."] },
  { id: "content", title: "4. Your content and AI features", paragraphs: ["You retain ownership of content you provide to ReachPilot. You grant us the limited rights necessary to operate, secure, and improve the service. AI suggestions are assistive outputs; you are responsible for reviewing them before publishing or sending them."] },
  { id: "plans", title: "5. Plans and payment", paragraphs: ["Plan names, limits, and prices are shown on the <a href='/pricing' class='placeholder'>pricing page</a>. If paid plans are activated, payment processing will be provided by <span class='placeholder'>[PAYMENT PROVIDER]</span> and additional billing terms will apply."] },
  { id: "availability", title: "6. Availability and changes", paragraphs: ["We may update, suspend, or discontinue parts of the service as ReachPilot develops. We will make reasonable efforts to preserve access and communicate material changes where practical."] },
  { id: "contact", title: "7. Contact", paragraphs: ["Questions about these terms can be sent to <span class='placeholder'>[LEGAL/SUPPORT EMAIL]</span>."] },
];

export default function TermsPage() { return <LegalPage eyebrow="Legal / 01" title="Terms of Service" intro="The rules for using ReachPilot thoughtfully and responsibly." sections={sections} />; }
