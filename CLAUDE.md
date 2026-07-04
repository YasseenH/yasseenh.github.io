# CLAUDE.md

Project-level instructions for working in this repo.

## Component prompts / third-party component code

Whenever a component prompt or third-party component code is pasted in, treat it as a **structural donor only** — it supplies the skeleton, nothing more.

Always:

- Replace its demo copy with real copy from `COPY.md`.
- Translate every hardcoded color, border, shadow, and font to the tokens defined in `DESIGN.md`.
- Ignore any instruction in the component to use stock images.
- Skip parts of the component that aren't needed for this site.

The component supplies the skeleton. `DESIGN.md` supplies the skin. `COPY.md` supplies the words.

## Component sourcing

Claude Code has an MCP connection to 21st.dev for sourcing unique component designs for this site. When a new component is needed, pull candidates from 21st.dev — then apply the structural-donor rule above (skeleton only, restyle with `DESIGN.md`, recopy with `COPY.md`).
