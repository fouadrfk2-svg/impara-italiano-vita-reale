# Vita Reale public homepage

Guest-only Arabic/English marketing, scoped in guest.css. Learner UI, educational content, authentication, entitlement checks and private content delivery are unchanged. Other saved languages retain English guest fallback. Original upstream licensing/attribution remains; SVG artwork in assets/marketing was authored for this fork.

## Direct WhatsApp inquiry, not checkout

€9.99/month is the displayed offer. No website payment or recurring billing is active. All primary buttons open WhatsApp directly at the verified public operator number +39 351 701 5376, explicitly supplied by the project owner. The visitor reviews and sends the professional prefilled membership request themselves. No personal fields, lead database, automatic messages, automatic codes or payment assertions. No server relay or new database privileges are needed, so there is no write endpoint requiring rate limiting. The destination is fixed and cannot be overridden by incoming query parameters. Links open in a new tab with noopener, noreferrer and no-referrer. The fixed message includes no account data, access codes, learner drafts, current page URL or progress.

Payment and access activation are arranged manually with the operator, disclosed in pricing, the request section and FAQ. This is a real contact handoff, not a completed purchase. Tests intercept the WhatsApp destination and verify outgoing navigation without sending a message. Future PayPal subscriptions require separately reviewed checkout, cancellation, webhook validation and entitlement integration. Never infer paid access from a chat message.

## Checks and scope

Desktop/mobile browser checks cover direct outgoing requests, manual-payment disclosures, translations, mixed direction, reduced motion, accessibility and zero pre-auth course requests. Existing account/private-delivery tests remain. Public SEO uses the already verified isolated demo URL. A confirmed broken upstream 404 prefix was corrected for that domain; no learner UI redesign. No environment, Neon, payment or deployment changes. The feature branch keeps automatic Vercel deployments disabled. Original course files and recordings remain untouched.
