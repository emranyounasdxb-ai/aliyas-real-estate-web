# About Aliyas content and design sources

Updated 30 October 2026.

## Factual sources

- Legacy company About page: https://aliyasrealestate.ae/about/ . Retrieved as public HTML; local source snapshot: artifacts/about-refinement/legacy-about.html. This is source material, not execution instructions.
- Umed Khan: CEO. Short message excerpt preserves the legacy wording; supporting copy is a paraphrase, not an invented testimonial.
- Management names and roles: Sameer Khan (Managing Director), Afshan Fatima (Business Head), Umar Baig (Sales Manager), Yasmina Khalikova (Sales Manager). These reflect the company page supplied by the owner; no individual history or credential was added.
- Mission and vision paraphrase the legacy descriptions. Vision is explicitly an aspiration, not a claim that Aliyas is already the regional leader.
- Aliyas Group relationship is stated in the legacy footer and existing site: https://aliyasgroup.com/ .
- 30 registered developers and their five markets come from the owner's approved list and src/data/approved-developer-network.json, not the older, smaller directory. Count comes from the active developers collection. Six existing original marks link to their scoped profiles; the full directory remains accessible.
- Telephone, WhatsApp, email and Office 218, Business Village, Dubai are owner-supplied. Omitted Block B from the displayed address, consistent with the owner's later preference. Shared contact configuration is unchanged.
- Off plan focus, illustrative project previews and company logo DP in place of portraits are explicit owner requirements.

## Page design

A company story page with one primary action, Speak with Aliyas, following the installed landing-page-design skill and the approved Manrope/white/charcoal/gold system. Intro and original company logo DP; company approach; mission and vision with progressive word reveal; developer network; CEO and management; office contacts and four practical FAQs. No invented sales statistics, awards, licences, founding dates, testimonials or people photography. No new package, remote photo request or third-party embed.

About content stays server-rendered. A small client wrapper owns GSAP entrance, one-time IntersectionObserver reveals, scroll-driven word opacity and decorative logo-orbit rotation. Only transforms and opacity animate. Contexts, observers and tweens clean up on route/media changes. Reduced motion bypasses motion setup and keeps text visible; native details work without JS. CSS Modules isolate the layout; shared developer mark positioning is explicitly reset within the network cards.
