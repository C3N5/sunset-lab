# Sunset Lab ☀️

An interactive physics visualization of the **sunset observation from the original student submission**: after a sunset, raising the observer's eyes can reveal the Sun again for a short time.

> **This is not an answer key.** The original submission is the historical starting point, including its rough assumptions and reasoning. 

## Run it

### Option A — No installation (offline)
Download [Sunset_Lab_Offline.html](Sunset_Lab_Offline.html) from GitHub and double-click it. This file embeds its HTML, CSS, JavaScript and physics module and runs without a server.

### Option B — Edit the source (recommended)
Clone or download the repository, open a terminal in the folder and run:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000**. The modular `index.html` imports `app.js` and `physics.mjs`, so **opening the modular index.html with file:// can fail due to browser module security**; use a local server. There are no third-party dependencies to install.

### Run the tests
Node.js 20+ recommended:

```bash
npm test
```

GitHub Actions also checks JavaScript syntax, the physics tests and the offline bundle on each push.

## What's interactive?

- Two animated views: **lower and higher eye positions** show different sunset timing.
- Raising an observer changes the **reference-Earth predicted extra sunset visibility**.
- The assumed solar angular-rate slider changes the **predicted time and playback speed**.
- The observed delay is kept separate and used to estimate the **inferred** Earth radius.
- Exact and small-angle formula comparison, height-dependent geometry sketch, sensitivity graph, and exportable notebook.
- `Reset` and `Play` replay the updated physics scenario, not the same fixed motion.

**Important distinction:** the animation uses a fixed 6,371 km reference Earth to predict what you *would* see. The radius output uses your entered *observed delay* to infer a radius. Those numbers need not agree. Vertical angles are greatly amplified on screen.

## Scientific assumptions

Horizon dip angle at eye height `h` for a spherical planet of radius `R`:

```text
theta(h) = arccos(R / (R + h))
deltaTheta = theta(higher) - theta(lower)
deltaTheta = omega * observedSeconds

R_smallAngle ≈ 2 * (sqrt(higher) - sqrt(lower))^2 / deltaTheta^2
```

Baseline `omega = 2π/86400 rad/s` is **not generally the Sun's actual vertical angular speed**. A real experiment needs latitude/date and the geometry of the Sun's path, atmospheric refraction, actual eye heights, terrain conditions and measurement uncertainty. Refer to [PHYSICS.md](PHYSICS.md).

## Project files

| File | Purpose |
| --- | --- |
| [index.html](index.html) | Modular page and controls |
| [style.css](style.css) | Layout and responsive styles |
| [app.js](app.js) | View synchronization, graph and interaction |
| [physics.mjs](physics.mjs) | Pure equations and numerical solver |
| [tests/physics.test.mjs](tests/physics.test.mjs) | Automated tests of the actual model module |
| [Sunset_Lab_Offline.html](Sunset_Lab_Offline.html) | Complete standalone offline version |
| [.github/workflows/verify.yml](.github/workflows/verify.yml) | GitHub Actions verification |
| [GITHUB_PAGES.md](GITHUB_PAGES.md) | Instructions for publishing a live website |

## Source and attribution

The user's actual sunset submission motivated the model: changing perspective by standing, seeing farther over Earth's curve, the 11-second observation, an approximate 0 m versus 1.83 m eye-height pair, the right triangle and the use of `R/(R+h)`. The submission was itself prepared through interactive tutoring and LaTeX help, and its reasoning and assumptions are **not independently verified as an exact physical solution**. The original submitted PDF is **not publicly reposted** here.

