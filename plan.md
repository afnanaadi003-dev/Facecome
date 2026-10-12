# Facecome — Plan

A simple social-style web app where users can create an account, log in, share
posts (text, photo, video, live), react and comment, join events, and keep a
personal timeline of thoughts.

## Brand — "Facecome: every day, every voice"
- Logo: a sunrise inside a chat bubble — a rounded speech bubble with a rising sun.
- Represents daily connection: each day your voice rises like a new sun.
- Theme: warm gradient (dawn orange → dusk violet), light airy cards, soft shadows.

## Features

### 1. Login page (auth)
- New Facecome sunrise/bubble logo (inline SVG) at the top of the page.
- Email + password fields with validation.
- One "Create a new account" button + "Forgot password?" link.
- Error message shown for wrong credentials or empty fields.

### 2. Sign-up page (auth)
- Facecome sunrise/bubble logo.
- Name, email, password (with confirm) fields.
- Basic validation (email format, password min 6 chars, password match).
- On success, account is stored and user is logged in → dashboard.

### 3. News feed (`dashboard.html`)
- **Composer (post box)** — avatar + text input ("What's on your mind?") +
  **Post** button.
- **Post types** the user can create:
  - **Text / thought** — plain message.
  - **Photo (de photo)** — picked with a file input, previewed and stored as
    a data URL (sized down to ≤ 400 KB so localStorage doesn't blow up).
  - **Video** — picked with a file input, played with a native `<video>` tag.
  - **Live talking** — a "Go live" post that records a short voice note with
    `MediaRecorder`; for browsers without mic access it falls back to text.
- **Reactions** on every post: 👍 thumbs-up like button (toggles, shows count)
  and 💬 comment icon that opens the comment thread.
- **Comments** — each post has a comment list and a small comment input;
  comments are stored per post and show author + time.
- **Join button ("Wanna join?")** — a user can post an invitation ("game
  night", "study room", loop whatever). Other users see a **Join** button on
  those posts; joining toggles and shows the participant count with names.
- **Feed ordering** — newest post on top; each post shows author name,
  avatar and relative time ("2 min ago").

### 4. Timeline (thoughts) — `timeline.html`
- Personal, reverse-chronological list of **only the current user's** posts.
- Same card layout as the feed (media, likes, comments, join states all work).
- Shows the running count: "N thoughts so far".
- Reached from the feed's top bar (**Timeline** link) and from the profile.

### 5. User profile — `profile.html`
- **Avatar (de photo)** — user can upload a profile photo (stored as a
  data-URL, downscaled the same way); defaults to an initials badge.
- Editable **display name** and short **bio**.
- Stats: number of thoughts posted, total likes received, joins.
- Shows the user's own recent posts inline (latest 3) + link to full timeline.
- Reached from the feed's top bar (**Profile** link).

### 6. Seed demo content
- On first load the feed is seeded with a few sample posts from demo users so
  the feed never looks empty (can be cleared from the profile page).

## Shared behaviors
- Everything is stored client-side in `localStorage` (demo app — no server):
  - `facecome_users` — registered accounts (`{ name, email, password, avatar, bio }`).
  - `facecome_session` — currently logged-in email.
  - `facecome_posts` — all posts (`{ id, author, type, text, media, createdAt,
    likes[], comments[], invites{joined[]} }`).
- Already-logged-in users opening the login page go straight to the feed.
- Logged-out users opening the feed/profile are sent back to `login.html`.
- Shared JS: `js/auth.js` (accounts/session), `js/posts.js` (feed/timeline data
  layer), `js/feed.js` (feed rendering + composer), `js/timeline.js`,
  `js/profile.js`, `js/pw-toggle.js`.

## Pages
| Page | File |
| --- | --- |
| Login | `login.html` |
| Sign-up | `signup.html` |
| Forgot password | `forgot-password.html` |
| News feed | `dashboard.html` |
| Timeline (thoughts) | `timeline.html` |
| Profile | `profile.html` |

## Tech
- Plain HTML + CSS + vanilla JS — no build step, open in a browser.
- Shared styles in `css/style.css`, logo as inline SVG component.
- Demo auth + data in `localStorage`; **not** for production
  (plain-text passwords, client-side only, media capped in size).
