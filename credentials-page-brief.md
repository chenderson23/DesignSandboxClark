# Credentials & API Keys Management

## Status
**Stage:** Brief captured, layout exploration not started  
**Next:** Decide primary layout pattern (table vs. card list) and creation flow surface (SideSheet vs. Modal)

---

## Purpose

Give org admins a single page to manage the full credential lifecycle — create, monitor, rotate, and revoke API keys. The core value is **visibility into credential health** (not just existence): surfacing what's expiring, what's been revoked, and enabling bulk action for larger teams who might have dozens of keys in play.

---

## Users & Context

- **Who:** Org admins only (not end users) — auth guard required before building
- **Frequency:** Occasional — not a daily-use screen, but high-stakes when used
- **Risk level:** High — mistakes (wrong revoke, accidental rotation) can break integrations in production
- **Implication:** Destructive actions (revoke, rotate) need confirmation. Bulk actions need extra care — confirm count and scope before executing.

---

## Credential Data Model

Each credential has:

| Field | Notes |
|---|---|
| Name / label | Human-readable, admin-assigned |
| Key ID | Truncated display only, e.g. `sk_live_abc...xyz` |
| Status | See states below |
| Created date | — |
| Created by | User who generated it |
| Expiration | Date, or "No expiration" |
| Last used | Date, or "Never" |
| Scopes | Permissions assigned at creation |

### States

| State | Trigger | Visual treatment TBD |
|---|---|---|
| **Active** | Default; within expiration window | — |
| **Expiring soon** | ≤ 30 days to expiration | — |
| **Expired** | Past expiration date, not explicitly revoked | — |
| **Revoked** | Manually invalidated by admin | — |

> **Note:** The 30-day "expiring soon" threshold is an assumption — confirm with product whether this should be configurable.

---

## Interaction Inventory

### Primary actions
| Action | Trigger | UX implication |
|---|---|---|
| **Create** | CTA button (top of page) | Opens creation flow — SideSheet or Modal, TBD |
| **Copy key** | Only at moment of creation | One-time reveal; never shown again after dismissal |
| **Rotate** | Per-row action | Generates new secret, invalidates old one — needs confirmation + new key reveal |
| **Revoke** | Per-row action | Immediate invalidation — needs confirmation dialog |
| **Bulk revoke/export** | Multi-row selection | Bulk action bar appears on selection; only valid for non-revoked keys |

### Secondary actions
| Action | Notes |
|---|---|
| Filter by status | All / Active / Expiring / Revoked — scope TBD (tabs vs. chip filter vs. dropdown) |
| Sort columns | By name, created date, expiration, last used |
| Search | Nice-to-have; not confirmed as required |

---

## Open Design Questions

Ranked by how much they affect layout decisions:

1. **Creation/rotation flow surface** — SideSheet (keeps context, good for forms) vs. Modal (more focused, cleaner for the one-time key reveal). The key reveal moment is the deciding factor — a Modal is easier to make feel intentional and dismissible.

2. **How much detail in the table vs. a detail surface?** — Options: (a) all data in the table row, (b) collapsed row with expandable detail, (c) row click opens a detail SideSheet. Affects column count and whether scopes are visible inline.

3. **Rotation flow** — inline row replacement vs. opening the same creation-style surface. Inline is faster but the new key reveal needs a contained moment; a surface (Modal/SideSheet) handles that better.

4. **Expired key visibility** — stay in the table indefinitely (with visual de-emphasis) vs. auto-archive after N days vs. hidden behind a toggle. Indefinite visibility is safest for audit purposes.

5. **Bulk action bar placement** — sticky bottom (Material pattern, non-destructive feel) vs. top of table (scannable, closer to the data). Bottom is the Phoenix/Material 3 convention.

---

## Layout Hypotheses

Not locked — capturing current thinking to pressure-test:

- **Primary pattern:** `PhxDataTable` with row-level actions and multi-select
- **Above the table:** Page header with "Create API Key" CTA + status filter (tabs or chips)
- **Creation/rotation:** `PhxModal` — leans toward this over SideSheet because the key reveal needs a contained, intentional moment
- **Bulk action bar:** Appears at bottom of viewport on row selection, shows count + available actions
- **Empty state:** Needed — org has no keys yet; should include a CTA to create the first one

---

## Phoenix Component Candidates

| Component | Role | Status |
|---|---|---|
| `PhxDataTable` | Primary list — selection, sort, row actions | Likely |
| `PhxBadge` | Status indicator per row | Likely |
| `PhxButton` | Create CTA, row actions, bulk actions | Confirmed |
| `PhxModal` | Creation flow, rotation flow, revoke confirmation | Leaning toward |
| `PhxSideSheet` | Alternative to Modal for creation — still open | Candidate |
| `PhxTextField` | Key name input in create form | Likely |
| `PhxSelect` | Scope/permission selection in create form | Likely |
| `PhxSnackbar` | Post-action feedback (created, revoked, rotated) | Likely |
| `PhxChip` / `PhxTabs` | Status filter above table | Candidate — depends on filter pattern chosen |

---

## Constraints (Non-Negotiable)

- **Auth guard:** Admin-only. Do not build or demo without the route being protected.
- **Key value display:** Only shown once — at the moment of creation (or rotation). Never retrievable afterward.
- **Confirmation required:** Revoke and Rotate are both destructive. Both need an explicit confirmation step, not just a single click.
- **Bulk actions scope:** Only applicable to non-revoked keys. Revoked keys must be excluded from bulk selection targets.

---

## Iteration Log

_Decisions and direction changes get recorded here as we work. Most recent first._

| Date | Decision | Reasoning |
|---|---|---|
| 2026-06-11 | **Page built — v1 shipped** | PhxDataTable + status filter chips + 5 modal types (create, key-reveal, rotate-confirm, revoke-confirm, bulk-revoke-confirm) + PhxSnackbar feedback. Key value shown once only. Confirm required for rotate + revoke. |
| 2026-06-11 | **Creation surface → PhxModal** | SideSheet question resolved in favor of Modal. Key reveal moment needs a focused, dismissible container — Modal handles this better than SideSheet. |
| 2026-06-11 | **Scopes shown as supportingText in Name column** | Avoids a wide column count while keeping scope info scannable inline. |
| 2026-06-11 | **Expired keys stay in table indefinitely** | Safest default for audit purposes. No auto-archive. Toggle/filter available via status chips. |
| 2026-06-11 | **Status filter → PhxChip type="filter" in PhxChipGroup** | Faster to scan than dropdown, clearer than tabs. Filter chips are the Phoenix pattern for multi-status faceting. |
| 2026-06-11 | Brief structured for iteration | Initial capture reformatted; layout and flow surfaces not yet decided |
