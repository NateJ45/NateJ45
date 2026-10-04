<div align="center">

# Nathan Nixon

### Web designer and developer. Founder of [Nixon Creative Studio](https://www.nixoncreativestudio.com).

I design and build fast, editor-friendly websites for churches, schools, nonprofits and small businesses, and I turn the lessons from every project into tooling the next one inherits.

[![Website](https://img.shields.io/badge/nixoncreativestudio.com-1a1a1a?style=for-the-badge&logo=cloudflare&logoColor=F38020)](https://www.nixoncreativestudio.com)
[![Stone Steps 50K](https://img.shields.io/badge/Selected%20work-Stone%20Steps%2050K-2e7d32?style=for-the-badge)](https://stonesteps50k.com)

</div>

---

## What I do

- **Design and build marketing sites** on Astro, Sanity and Cloudflare Workers, with content editors can change on the page without calling me.
- **Rebuild and migrate** sites off Wix, Squarespace and WordPress, including content recovery, redirects and a clean DNS cutover.
- **Run a repeatable studio pipeline**: one canonical starter, a registry of improvements ("port cards"), drift detection and a shared test standard across every live site.

## Selected work

| Project | What it is | Stack |
|---|---|---|
| [**Stone Steps 50K**](https://github.com/NateJ45/stonesteps-50k) · [live](https://stonesteps50k.com) | Race site for a Cincinnati trail ultra, rebuilt from WordPress. A **2003 to 2025 results archive** recovered from the Wayback Machine and RunSignUp, a nightly workflow that imports new results and bakes in race-day weather, a working contact form on Cloudflare Email Sending and D1, and daily encrypted Sanity backups. | Astro 7, Sanity, Cloudflare Workers, D1, R2 |
| [**NCS Astro + Sanity Starter**](https://github.com/NateJ45/ncs-astro-sanity-starter) | The reusable foundation under every site below: page-builder-first, live draft preview with click-to-edit on the page, one-command brand reskin, opt-in module library, and a registry of **port cards** that carry each fix from one repo to the rest of the family. | Astro, Sanity, Tailwind 4, React 19, Playwright |
| [**First Baptist Church Muncie**](https://github.com/NateJ45/fbcm) | Full redesign replacing a Wix site: **142 posts, a 138-photo library**, staff, ministries and church PDFs served from R2, all migrated into Sanity. | Astro, Sanity, Cloudflare Workers, R2 |
| [**Presbyterian Academy**](https://github.com/NateJ45/presacademy) · [live](https://presbyterianacademy.org) | School site on the studio stack, with an embedded Studio at `/studio`, Playwright, Lighthouse and visual-regression gates, and armed weekly encrypted backups. | Astro, Sanity, Cloudflare Workers |
| [**Reid Design**](https://github.com/NateJ45/reid-design-site) · [live](https://reiddesignllc.com) | Interior design studio site with a scroll-driven annotated concept room where each piece appears with its sample tag, and a Walnut-and-bronze identity. | Astro, Sanity, Cloudflare Workers |
| [**MAS Monograms**](https://github.com/NateJ45/mas-monograms) · [live](https://mas-monograms.com) | Embroidery shop rebuilt off Squarespace. Quote form is the only write path (Turnstile, R2, Resend), with in-canvas editing and live preview for the owner. | Astro, Sanity, Cloudflare, Turnstile |
| [**Nixon Creative Studio**](https://github.com/NateJ45/nixoncreativestudio) · [live](https://www.nixoncreativestudio.com) | The studio's own site on Cloudflare **EmDash CMS**: case studies, pricing and journal editable from an admin with passkey login, hybrid static plus server rendering behind a purge-on-publish cache. | Astro, Cloudflare, EmDash CMS, D1, R2 |

Also in production: two WordPress sites on **Bricks Builder** for theological organisations ([Foundation for Reformed Theology](https://foundationrt.org) at Lighthouse **100/100/100/100** mobile, and [Theology Matters](https://theologymatters.com) with a 154-post journal archive), each shipped from a private Git-deployed child theme behind Cloudflare.

## How I work

- **Every site meets the same bar.** Playwright smoke, axe and reflow tests on Chromium and WebKit iPhone, a Lighthouse gate, visual regression, prettier, type checks and link checks, with `main` protected behind PR plus green CI.
- **Fixes travel.** A lesson learned on one client site gets a port card in the starter, then rolls out to the rest, and `sync-check` catches drift.
- **Backups are boring and automatic.** Encrypted weekly Sanity exports to GitHub artifacts and R2, with a retention policy.
- **Docs are part of done.** Every repo carries a CLAUDE.md, a runbook and a dated decisions log, so the next session (mine, an agent's or a collaborator's) starts informed.
- **I measure before I fix.** The Stone Steps LCP work blamed the stylesheet for a week until blocking one resource class at a time found the real cause in an hour.
- **AI-assisted, human-reviewed.** I delegate scoped implementation to coding agents, then review, verify and integrate myself.

## Tech

<div align="center">

![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-F03E2F?style=flat-square&logo=sanity&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![WordPress](https://img.shields.io/badge/WordPress_+_Bricks-21759B?style=flat-square&logo=wordpress&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Apps_Script-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

| Area | Tools |
|---|---|
| **Front end** | Astro 7, React 19 islands, Tailwind 4, shadcn/ui, view transitions, scroll-driven motion, accessible and responsive by default |
| **Content** | Sanity v6 (embedded Studio, live preview, click-to-edit), EmDash CMS, WordPress with Bricks, ACF and RankMath |
| **Edge and data** | Cloudflare Workers, D1, R2, Email Sending, Turnstile, DNS, WAF and cache rules, Stripe Payment Links, Resend |
| **Quality** | Playwright (Chromium and WebKit), axe, Lighthouse CI, visual regression, prettier, protected branches and required checks |
| **Automation** | GitHub Actions (nightly imports, encrypted backups, uptime checks), Node scripts, Google Apps Script, Claude Code agents |

## Working with me

I take on a small number of builds at a time: church, school and small-business sites that need to look expensive, load fast and be easy for the owner to edit. Pricing, process and case studies are at **[nixoncreativestudio.com](https://www.nixoncreativestudio.com)**.

<div align="center">

[![Website](https://img.shields.io/badge/Website-nixoncreativestudio.com-1a1a1a?style=flat-square)](https://www.nixoncreativestudio.com)
[![Email](https://img.shields.io/badge/Email-nathan%40nixoncreativestudio.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:nathan@nixoncreativestudio.com)

</div>
