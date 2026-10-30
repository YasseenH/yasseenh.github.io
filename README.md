# Personal Website

Source for my personal site, built with [Astro](https://astro.build) and Tailwind v4.

- `DESIGN.md` — design system tokens (colors, type, spacing)
- `COPY.md` — approved page copy and SEO targets
- `src/pages/` — the 5 routes: Home, Experience, Projects, About, Contact

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Deployment

Deploys to GitHub Pages via the GitHub Actions workflow in
`.github/workflows/deploy.yml`.

## Motion and tennis demo

The homepage uses a subtle, interactive ripple grid adapted from Aceternity's
[Background Ripple Effect](https://ui.aceternity.com/components/background-ripple-effect).
The grid sends out one or two staggered waves about every five seconds.
Click or tap the hero background to add a wave at any time. Automatic ripples
pause offscreen, in hidden tabs, and while tennis is open. The gently floating portrait
retains its rounded rectangular frame with a tighter chest-up crop. System reduced-motion
preferences disable decorative animation. The comparison switch is removed.

Click the small tennis ball on the homepage for a full-screen,
US Open-inspired blue hard court. Move the mouse in both directions to move your
racket; returns happen automatically after the first bounce. Hit off-center to
aim. Press D to select drop shots or L for high, deep lobs. Press the same key
again to return to a drive. Shot selection stays active for subsequent returns;
mouse buttons do not change it.

Short balls force the CPU to approach the net. A lob can push it back. The CPU
has limited movement and reaction time, chooses shots based on your position,
and can hit out. Nets, first-bounce outs, and second bounces resolve points.
The umpire calls the result beside the net. Each point waits for your serve:
move to position and aim, then double-click the court. Enter is the accessible
keyboard alternative. A single click never serves.
The compact two-row broadcast score sits at the top right and marks you as the
server. Spectators fill the outer stands, and racket branding sits on the grips.
One game uses 0/15/30/40 scoring, deuce, advantage, and a two-point winning margin.

On touchscreens, drag to move, double-tap to serve, and use the Drop/Lob controls.
Single taps and drags do not serve. Arrow keys also move the racket. P pauses and Escape closes
the game. The ? button shows controls.
Switching away pauses play; Resume continues it. Reopening an unfinished rally
also waits for Resume.

The preview and production build use separate Vite caches. Headings and the
portrait render visibly before hydration, so an interrupted client script does
not hide the homepage.

```bash
npm test          # game rules, scoring, and background motion tests (Node 22.12+)
npm run build     # game/input tests, production build, CSP injection, rendering checks
npm run preview   # serve the production output locally
```
