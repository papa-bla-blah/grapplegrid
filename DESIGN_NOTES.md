# NUMAROW DESIGN NOTES & CHANGELOG

## Current Version: v1.2 (Dev Dashboard)

---

## CORE GAME RULES

### Grid Setup
- **Numbers**: 0, 1, 2, 3, 4, 5
- **Column Constraint**: Each number 1-5 can only appear ONCE per column. Zero (0) is unlimited.
- **Budget**: Total points that can be placed (e.g., 40 for 5×5)
- **Sizes**: 2×3 (tutorial), 3×3, 4×4, 5×5 (main), 6×6

### Scoring System (CURRENT - v1.2)

**Per Cell Comparison:**
1. Compare all players' values at each cell
2. Find highest value
3. If single winner (no tie) with value > 0:
   - Points awarded = gap (highest - second_highest)
4. If tie at highest, or all zeros: No points awarded

**SIMPLE GAP SCORING** - No multipliers currently implemented.

---

## SCORING VARIANTS (For Testing)

### Option A: Simple Gap (CURRENT)
```
points = highest - second
```

### Option B: Gap with Multipliers (4+ players only)
```
gap = highest - second

IF players >= 4:
  IF gap >= 3: points = gap × 2.0
  IF gap == 2: points = gap × 1.5
  IF gap == 1: points = gap × 1.0
ELSE:
  points = gap
```

### Option C: Gap Squared (DEPRECATED)
```
points = gap × gap
```
Note: Gap-squared was considered but creates too much variance - dominant wins become blowouts.

---

## DESIGN DECISIONS LOG

### 2026-01-07: Position Multipliers REMOVED
**Decision**: NO corner/edge/center position multipliers
**Reason**: Position multipliers create "corner rushing" as dominant strategy, reducing strategic diversity.
**Result**: All cells have equal base value, strategy depends purely on number placement and budget allocation.

### 2026-01-07: Gap Multipliers Discussion
**Proposal**: Add gap multipliers (2×, 1.5×, 1×) when 4+ players
**Status**: NOT YET IMPLEMENTED
**Rationale**: Rewards dominant cell wins, adds drama. Only activates with 4+ players to avoid distortion in 1v1.

### 2026-01-07: Budget Testing
**Test Plan**: Compare 40 vs 60 budget on 5×5
- Lower budget (40): Forces harder choices, favors cluster strategies
- Higher budget (60): More cells can have high values, favors spread strategies

---

## ONBOARDING FLOW

1. **2×3 grid** - Learn number placement (no column rule)
2. **3×3 grid** - Introduce column constraint
3. **3×3 grid** - Practice round with scoring
4. **4×4 grid** - Warm-up game
5. **5×5 grid** - Main competitive game

---

## AI STRATEGIES

| Strategy | Description | Cell Order | Value Selection |
|----------|-------------|------------|-----------------|
| Aggressive | All out | Edges/corners first | Always max |
| Defensive | Conservative | Center first | Prefer 2-4 |
| Min/Max | High risk | Random | Only 0, 1, or 5 |
| Balanced | Even spread | Random | Middle of valid |
| Unpredictable | Human-like | Random | 30% suboptimal |

---

## VERSION HISTORY

### v1.2 - Dev Dashboard (2026-01-07)
- DevDashboard.js component for simulation testing
- Configurable grid size, budget, player count
- 5 AI strategies with percentage distribution
- Math logging for score calculation debug
- Batch simulation support (sets × matches)

### v1.1 - Human Mode (2026-01-07)
- Chrome metallic grid design
- 35-second countdown timer
- Player ready status overlay
- Single human player support

### v1.0 - Initial (2026-01-06)
- Basic game mechanics
- Click/paint/keyboard input
- CSV/JSON data export

---

## TODO

- [ ] Implement gap multipliers (Option B) for testing
- [ ] Add radial menu input method
- [ ] Add vertical scroll input method
- [ ] Double-tap = 0 shortcut
- [ ] Sound effects (heartbeat timer)
- [ ] Export simulation data to spreadsheet
