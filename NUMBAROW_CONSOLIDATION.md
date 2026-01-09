# NUMBAROW - PROJECT CONSOLIDATION
**Merged from:** GrappleGrid + NUMAROW  
**Created:** January 8, 2026  
**Status:** Ready to Build Final Version

---

## 📊 EXECUTIVE SUMMARY

**NUMBAROW** is a competitive grid-based number placement game where players strategically allocate a budget of points across a grid to maximize their score against opponents.

**Core Loop:**
```
Place numbers (0-5) → Compare grids → Highest value wins cell → Score based on gap
```

**Platforms:** Web (React), Mobile (React Native future), Desktop (Electron future)

---

## 🎯 WHAT'S WORKING (Current Build)

**Location:** `/Users/celtic57/Downloads/grapplegrid-playtest`

### ✅ COMPLETE FEATURES

**Grid System:**
- Multiple sizes: 2×3 (tutorial), 3×3, 4×4, 5×5 (main), 6×6
- Column constraint: 1-5 only once per column (0 unlimited)
- Budget system: 40-70 points depending on grid size
- Valid move checking with visual feedback (red borders)

**Input Methods:**
- ✅ Click to cycle (0→1→2→3→4→5→0)
- ✅ Paint mode (select value, paint multiple cells)
- ✅ Keyboard (focus cell, press 0-5)
- ⚠️ Radial menu (DESIGNED, NOT IMPLEMENTED)
- ⚠️ Vertical scroll (DESIGNED, NOT IMPLEMENTED)
- ⚠️ Double-tap = 0 shortcut (TODO)

**Scoring:**
- Gap-based: winner gets (highest - second_highest) points
- No position multipliers (removed by design)
- Optional gap multipliers for 4+ players (designed but not active)

**AI System:**
- 5 strategies: Aggressive, Defensive, Min/Max, Balanced, Unpredictable
- Dev Dashboard for batch testing
- Configurable player counts (1-8)
- Simulation panel with math logging

**Visual Design:**
- Chrome metallic grid (human mode)
- Player status overlay
- Screen states (setup → placement → scoring → results)
- 35-second countdown timer

**Data Export:**
- CSV export (spreadsheet analysis)
- JSON export (detailed data)
- Batch simulation results

---

## 🎮 CORE GAME RULES

### **Numbers & Constraints**

**Available Values:** 0, 1, 2, 3, 4, 5

**Column Rule:**
- Each number 1-5 can appear only ONCE per column
- Zero (0) can appear unlimited times
- Invalid placements shown with red border

**Budget:**
```
2×3 (tutorial):  12 points
3×3 (training):  20 points
4×4 (practice):  35 points
5×5 (standard):  40-50 points (configurable)
6×6 (advanced):  70 points
```

Players must spend ENTIRE budget before submitting.

### **Scoring System**

**Per Cell Comparison:**
1. Find highest value at each cell
2. If single winner (no tie) and value > 0:
   - Points = gap (highest - second_highest)
3. If tie at highest, or all zeros: 0 points

**Gap Multipliers (Optional - 4+ Players):**
```
Gap ≥ 3:  points × 2.0
Gap = 2:  points × 1.5
Gap = 1:  points × 1.0 (no multiplier)
```
*Currently disabled, designed for future testing*

**Examples:**
```
Player A: 5    Player B: 3    Gap = 2  →  2 points to A
Player A: 4    Player B: 4    Tie      →  0 points
Player A: 5    Player B: 0    Gap = 5  →  5 points to A
Player A: 0    Player B: 0    All zero →  0 points
```

---

## 🎨 UI & UX DESIGN

### **Chrome Grid Design (Human Mode)**

**Appearance:**
- Metallic chrome/silver cells
- Glowing blue highlights on hover
- Red borders for invalid moves
- Green checkmarks when ready
- Player status overlay (top-right)

**Screen States:**
1. **Setup** - Choose grid size, budget, players
2. **Placement** - Players take turns placing numbers
3. **Scoring** - Automatic grid comparison
4. **Results** - Winner announced, scores displayed

**Timer:**
- 35-second countdown per player turn
- Visual countdown bar
- Optional sound effects (heartbeat)

### **Player Status Overlay**

**Displays:**
- Player names
- Colors (assigned automatically)
- Ready status (✓ or clock icon)
- Current turn indicator

**Position:** Top-right corner, semi-transparent

---

## 🕹️ INPUT METHODS

### **1. Click to Cycle (Default)**
```
Click cell → 0 → 1 → 2 → 3 → 4 → 5 → 0 → ...
```
- Simplest method
- Works on all devices
- Red border if next value breaks column rule

### **2. Paint Mode**
```
1. Click value button (0-5)
2. Click cells to "paint" that value
3. Fast for filling multiple cells
```

### **3. Keyboard Input**
```
1. Click cell to focus
2. Press 0-5 key to set value
3. Tab to next cell
```
- Fastest for experienced players
- Desktop only

### **4. Radial Menu (TODO)**
```
Long press/right-click cell → radial dial appears → drag to select value
```
**Design:**
- Center = current value
- 0-5 arranged in circle
- Drag to select, release to confirm
- Works on mobile + desktop

**Benefits:**
- One gesture for any value
- No multiple clicks needed
- Visual + tactile

### **5. Vertical Scroll (TODO)**
```
Focus cell → scroll up/down → value changes
```
**Design:**
- Mouse wheel on desktop
- Two-finger swipe on mobile
- Increment/decrement current value
- Wrap around (5→0, 0→5)

**Benefits:**
- Fine control
- Natural gesture
- Works with keyboard focus

### **6. Double-Tap = 0 (TODO)**
```
Double-tap any cell → instantly set to 0
```
**Rationale:**
- Zero is most common value (unlimited use)
- Fast reset
- Ergonomic shortcut

---

## 🤖 AI STRATEGIES

| Strategy | Behavior | Cell Order | Value Selection |
|----------|----------|------------|-----------------|
| **Aggressive** | Maximize dominance | Edges/corners first | Always max (5) |
| **Defensive** | Safe placement | Center first | Prefer 2-4 |
| **Min/Max** | High variance | Random | Only 0, 1, or 5 |
| **Balanced** | Even spread | Random | Middle of valid range |
| **Unpredictable** | Human-like | Random | 30% suboptimal choices |

**Usage in Dev Dashboard:**
- Set percentage distribution (e.g., 40% Balanced, 30% Aggressive, 30% Defensive)
- Run batch simulations (e.g., 10 sets × 100 matches)
- Export results to spreadsheet for analysis

---

## 📋 WHAT NEEDS TO BE DONE

### **High Priority (Core Gameplay)**

- [ ] **Implement radial menu input**
  - Design radial UI component
  - Add long-press detection
  - Test on mobile + desktop

- [ ] **Implement vertical scroll input**
  - Add scroll wheel handler
  - Mobile two-finger swipe
  - Wrap-around logic (5→0, 0→5)

- [ ] **Add double-tap = 0 shortcut**
  - Detect double-tap/double-click
  - Instant set to 0
  - Visual feedback

- [ ] **Sound effects**
  - Timer heartbeat (accelerating tempo)
  - Cell placement click
  - Invalid move buzz
  - Win/lose stings

- [ ] **Mobile optimization**
  - Touch-friendly cell sizing
  - Responsive grid layout
  - Gesture controls

### **Medium Priority (Polish)**

- [ ] **Onboarding tutorial**
  - 2×3 grid intro (no column rule)
  - 3×3 with column rule
  - 3×3 practice with scoring
  - 4×4 warm-up
  - 5×5 competitive

- [ ] **Gap multipliers toggle**
  - Settings option to enable/disable
  - Test 2× / 1.5× / 1× multipliers
  - UI indicator when active

- [ ] **Replay system**
  - Save grid configurations
  - Replay scoring step-by-step
  - Share match codes

- [ ] **Player profiles**
  - Track win/loss records
  - ELO/rating system
  - Achievement badges

### **Low Priority (Future)**

- [ ] **Multiplayer (online)**
  - WebSocket server
  - Matchmaking
  - Spectator mode

- [ ] **Mobile app (React Native)**
  - Native Android + iOS
  - Offline play
  - Push notifications

- [ ] **Desktop app (Electron)**
  - Standalone executable
  - Local tournaments
  - LAN multiplayer

---

## 🗂️ PROJECT STRUCTURE

**Current:**
```
grapplegrid-playtest/
├── src/
│   ├── App.js                 ← Main app logic
│   ├── GameBoard.js           ← Grid rendering + input
│   ├── GameSettings.js        ← Setup screen
│   ├── ScoreDisplay.js        ← Results screen
│   ├── DevDashboard.js        ← AI testing panel
│   ├── SimulationPanel.js     ← Batch simulations
│   └── DataCollector.js       ← CSV/JSON export
├── DESIGN_NOTES.md            ← Current design decisions
├── README.md                  ← Setup + workflow
└── NUMBAROW_CONSOLIDATION.md  ← THIS FILE
```

**Proposed (NUMBAROW Final):**
```
numbarow/
├── docs/
│   ├── README.md              ← Project overview
│   ├── GAME_RULES.md          ← Rules reference
│   ├── DESIGN_DECISIONS.md    ← Why we made choices
│   └── ROADMAP.md             ← Future features
├── src/
│   ├── components/
│   │   ├── Grid/              ← Grid rendering
│   │   ├── Input/             ← Radial, scroll, keyboard
│   │   ├── UI/                ← HUD, overlays, screens
│   │   └── AI/                ← AI strategies
│   ├── services/
│   │   ├── ScoringEngine.js   ← Gap calculation
│   │   ├── ValidationEngine.js← Column rule checking
│   │   └── DataExporter.js    ← CSV/JSON export
│   └── App.js
└── tests/
    ├── scoring.test.js
    ├── validation.test.js
    └── ai.test.js
```

---

## 🧪 TESTING STRATEGY

### **Unit Tests**

**Scoring Engine:**
```javascript
// Gap calculation
test('simple gap', () => {
  expect(calculateScore([5, 3])).toBe(2); // 5-3=2
});

test('tie', () => {
  expect(calculateScore([4, 4])).toBe(0);
});

test('all zeros', () => {
  expect(calculateScore([0, 0])).toBe(0);
});
```

**Column Validation:**
```javascript
test('valid column', () => {
  expect(isValidPlacement(column, 3)).toBe(true);
});

test('duplicate in column', () => {
  expect(isValidPlacement([1, 2, 1], 3)).toBe(false);
});

test('zeros allowed multiple times', () => {
  expect(isValidPlacement([0, 0, 0], 0)).toBe(true);
});
```

### **Integration Tests**

- Full game simulation (setup → placement → scoring → results)
- AI vs AI matches (verify strategies work)
- Budget validation (ensure all points spent)
- CSV/JSON export format correctness

### **User Testing**

**Target Players:**
- Strategy game players
- Puzzle enthusiasts
- Board game fans

**Test Scenarios:**
1. First-time tutorial (2×3 grid)
2. 3×3 competitive match
3. 5×5 with 4+ players (gap multipliers)
4. AI testing (Dev Dashboard)

---

## 📊 METRICS TO TRACK

**Per Game:**
- Grid size, budget, player count
- Winner, final scores
- Average score per player
- Largest gap in single cell
- Budget efficiency (points scored / points spent)

**Per Player:**
- Win rate
- Average score
- Favorite grid size
- Most used values (0-5 distribution)
- Average time per turn

**System Performance:**
- Load time
- Grid render performance
- AI decision time
- Simulation batch speed

---

## 🎯 DESIGN PRINCIPLES

### **1. Input Parity Across Platforms**
- Mobile (touch) = Desktop (mouse/keyboard) = Controller
- No platform has unfair advantage
- Gyro/scroll are optional enhancements, never required

### **2. Strategic Depth Without Complexity**
- Simple rules (place numbers, gap scoring)
- Deep strategy (budget allocation, opponent prediction)
- Easy to learn, hard to master

### **3. Fast Paced Matches**
- 35 seconds per turn
- 5×5 grid = 5 players × 35 sec ≈ 3 minutes per game
- Quick feedback loop

### **4. Fair Competition**
- No pay-to-win
- No RNG (deterministic scoring)
- Skill-based matchmaking (future)

### **5. Data-Driven Balance**
- AI simulations test balance
- Export data for analysis
- Iterate based on metrics

---

## 🚀 LAUNCH PLAN

### **Phase 1: MVP (Current → 2 weeks)**
- ✅ Core gameplay working
- ✅ AI opponents
- ✅ Dev Dashboard
- ⚠️ Add radial menu
- ⚠️ Add vertical scroll
- ⚠️ Add double-tap = 0
- ⚠️ Sound effects
- ⚠️ Mobile optimization

### **Phase 2: Beta (2-4 weeks)**
- Onboarding tutorial
- Player profiles (local)
- Replay system
- Gap multipliers toggle
- Comprehensive testing

### **Phase 3: Launch (1-2 weeks)**
- Deploy to web (Vercel/Netlify)
- Landing page + marketing
- Community Discord
- Collect feedback

### **Phase 4: Expansion (Ongoing)**
- Online multiplayer
- Mobile apps (React Native)
- Desktop app (Electron)
- Tournaments + leaderboards

---

## 🧠 MEMORY PURGE NOTES

**What to Remember:**
- NUMBAROW = competitive grid number placement game
- Location: `/Users/celtic57/Downloads/grapplegrid-playtest`
- Core: 0-5 numbers, column constraints, gap scoring
- Status: ~70% complete, needs radial menu + scroll input

**What to Forget (It's in Docs):**
- Specific AI strategy implementations
- Exact scoring formulas
- UI component details
- Git commit history

**What to Preserve:**
- User flow (setup → placement → scoring → results)
- Design principles (input parity, strategic depth)
- Testing strategy
- Launch roadmap

---

## 📞 PROJECT INFO

**Developer:** Liam O'Connor  
**Company:** OG SAAS LLC  
**Partner:** Roger Grubb  
**Repository:** Local (no GitHub yet)  
**Status:** ✅ Consolidated and ready to finalize

---

**NEXT STEPS:**
1. Rename project folder to `numbarow`
2. Implement radial menu input
3. Implement vertical scroll input
4. Add sound effects
5. Mobile optimization
6. Launch MVP

---

**END OF CONSOLIDATION DOCUMENT**
