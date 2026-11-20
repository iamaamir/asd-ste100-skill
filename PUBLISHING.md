# GitHub publication checklist

Repository slug: `iamaamir/asd-ste100-skill`.

**Recommended GitHub About description:**

> Agent Skill for ASD-STE100 Simplified Technical English (STE): technical writing, maintenance procedures, controlled-language reviews, and an offline checker.

**Suggested GitHub topics:**

`asd-ste100`, `simplified-technical-english`, `technical-writing`, `controlled-language`, `agent-skills`, `technical-documentation`, `documentation`, `maintenance-manuals`, `writing-assistant`, `python`

## Repository maintenance

The repository is published at <https://github.com/iamaamir/asd-ste100-skill>. Update repository metadata in GitHub's About section. Keep the skill under `skills/ste-technical-writing/` for auto-discovery by the `skills` CLI.

When changing the skill, run the local verification script, review controlled-language and safety boundaries, then push the changes to the default branch. GitHub Actions runs the Python test matrix on pushes and pull requests.

## Check after publishing

```bash
npx skills add iamaamir/asd-ste100-skill --list
npx skills add iamaamir/asd-ste100-skill --skill ste-technical-writing --global --agent '*' --yes
```

Check the installed skill's `SKILL.md` and scripts. Test the installation in a sandbox or development environment before rolling it out broadly.
