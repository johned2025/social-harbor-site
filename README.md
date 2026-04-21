# Social Harbor — Landing Page & Deep Link Handler

Production website built for [Harbor](https://github.com/Bakobiibizo/harbor), a decentralized social network.
**Live site → [social-harbor.com](https://www.social-harbor.com)**

---

## What This Is

This repo contains two things delivered as a single contract:

### 1. Landing Page (`index.html`)
A brand-compliant marketing page for the Harbor app — introducing the product, communicating its value, and directing users to download the app on their platform.

### 2. Deep Link Handler (`/add-friend`)
A redirect page that intercepts Harbor deep links shared in web chats and messaging apps. When a user clicks a Harbor friend-request link:

- On **desktop** — the page opens the Harbor desktop app directly and displays the friend request data
- On **mobile** — the page shows platform-specific download buttons (with OS detection) so the user can install Harbor first

Deep links also include **Open Graph meta tags** so when pasted into a web chat (Slack, Discord, iMessage, etc.) they render a preview with a thumbnail image and short description.

---

## Tech Stack

| | |
|---|---|
| HTML / CSS / Vanilla JS | No framework — delivered as a lightweight static site |
| Vercel | Deployment and routing (`vercel.json`) |
| Open Graph | SEO meta tags for rich link previews |

---

## My Role

Sole developer on this feature. Delivered from a written requirements list with full independence on technical decisions.

- Built and styled the landing page following the owner's brand guidelines
- Implemented the deep link routing logic in JavaScript
- Added Open Graph meta tags for rich preview support across messaging platforms
- Configured Vercel routing to handle the `/add-friend` path correctly
- Coordinated with the Harbor Rust backend team on the deep link URL structure

---

## Project Structure

```
social-harbor-site/
├── index.html          # Main landing page
├── add-friend/         # Deep link redirect handler
├── assets/             # Images and brand assets
├── css/                # Stylesheets
├── js/                 # JavaScript (deep link logic, OS detection)
└── vercel.json         # Routing config
```

---

## Related

- [Harbor app repo](https://github.com/Bakobiibizo/harbor) — the desktop client this site supports (Rust)

---

## Author

**John Solarte** — Junior Full-Stack Developer based in Kelowna, BC
[github.com/johned2025](https://github.com/johned2025) · [Portfolio](https://john-solarte-portfolio.netlify.app/) · [LinkedIn](https://www.linkedin.com/in/john-solarte/)
