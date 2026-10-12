# Facecome — Plan

A simple social-style web app where users can create an account and log in.

## Brand — "Facecome: every day, every voice"
- Logo: a sunrise inside a chat bubble — a rounded speech bubble with a rising sun.
- Represents daily connection: each day your voice rises like a new sun.
- Theme: warm gradient (dawn orange → dusk violet), light airy cards, soft shadows.

## Features

### 1. Login page (auth)
- New Facecome sunrise/bubble logo (inline SVG) at the top of the page.
- Email + password fields with validation.
- "Log in" button, link to sign-up page.
- Error message shown for wrong credentials or empty fields.

### 2. Sign-up page (auth)
- Facecome sunrise/bubble logo.
- Name, email, password (with confirm) fields.
- Basic validation (email format, password length, password match).
- On success, account is stored and user is logged in → dashboard.

### 3. Dashboard (after login)
- Welcome header with the logged-in user's name.
- "Log out" button returns to the login page.

## Auth behavior
- Demo auth stored client-side in `localStorage`:
  - `facecome_users` — list of registered accounts (`{ name, email, password }`).
  - `facecome_session` — currently logged-in email.
- Already-logged-in users opening the login page go straight to the dashboard.

## Pages
| Page | File |
| --- | --- |
| Login | `login.html` |
| Sign-up | `signup.html` |
| Forgot password | `forgot-password.html` |
| Dashboard | `dashboard.html` |

## Tech
- Plain HTML + CSS + vanilla JS — no build step, open in a browser.
- Shared styles in `css/style.css`, logo as inline SVG component, shared JS in `js/auth.js`.
