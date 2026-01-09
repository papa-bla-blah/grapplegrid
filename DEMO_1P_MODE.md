# DEMO: 1 PLAYER MODE

**Branch:** `demo-1p-mode`  
**Status:** ✅ Complete and functional  
**Date:** January 8, 2026

---

## WHAT THIS DEMO DOES

Single-player NUMBAROW where 1 human player competes against 2-10 AI opponents using a **radial menu** for intuitive number input.

**Key Features:**
- ⭐ **Radial menu input** - Right-click or long-press for circular value selector
- ⏱️ **No timer** - Human takes as long as needed
- 🤖 **Scalable AI** - Choose 2-10 opponents
- 📊 **Full scoring** - Gap-based scoring with results breakdown
- 🎮 **Quick replay** - Play again instantly

---

## HOW TO RUN

```bash
# Switch to branch
git checkout demo-1p-mode

# Install dependencies (if needed)
npm install

# Start dev server
npm start
```

Opens at http://localhost:3000

---

## GAME FLOW

### 1. **Setup Screen**
- Choose number of AI opponents (2-10)
- Fixed 5×5 grid, 40 point budget
- Click "START GAME"

### 2. **Playing Screen**
- Place numbers 0-5 on grid
- Budget tracker shows remaining points
- Must spend exactly 40 points
- **Input methods:**
  - **Quick click**: Click cell to cycle 0→1→2→3→4→5
  - **Radial menu**: Right-click or long-press (500ms) → drag to select → release

### 3. **Results Screen**
- Scoreboard ranked by points
- Your placement highlighted
- Grid comparison (your grid + top 3 AI)
- "PLAY AGAIN" button

---

## RADIAL MENU CONTROLS

**Desktop:**
- Right-click cell → radial menu appears
- Drag mouse to highlight value (0-5)
- Release to confirm selection
- Click outside to cancel

**Mobile:**
- Long-press cell (500ms) → radial menu appears
- Drag finger to highlight value
- Release to confirm
- Tap outside to cancel

**Design:**
- Center circle shows current value
- 6 values arranged in circle (60° apart)
- Selected value scales up and turns orange
- Purple gradient theme

---

## AI STRATEGIES

| Strategy | Behavior |
|----------|----------|
| **Aggressive** | Always places highest valid value |
| **Defensive** | Always places lowest valid value |
| **Balanced** | Places middle value of valid range |
| **Unpredictable** | Random selection from valid values |

AI opponents rotate through strategies for variety.

---

## TECHNICAL DETAILS

### **New Components**

**Demo1PMode.js** (334 lines)
- Main game controller
- Setup → Playing → Results screens
- AI grid generation
- Scoring calculation

**RadialMenu.js** (126 lines)
- Circular value selector
- Mouse/touch tracking
- Angle-based selection (60° segments)
- Visual feedback (scaling, color change)

**RadialMenu.css** (78 lines)
- Purple gradient center (#667eea → #764ba2)
- Orange selection highlight (#FF7321)
- Mobile touch optimizations

**Demo1PMode.css** (352 lines)
- Full game styling
- Setup panel
- Budget tracker
- Results scoreboard
- Grid comparison layout

### **Updated Components**

**GameBoard.js**
- Integrated radial menu
- Long-press detection (500ms)
- Touch event support
- Chrome grid rendering

**App.js**
- Simplified to render Demo1PMode only

**App.css**
- Chrome metallic cell styling
- Grid layout improvements

---

## SCORING RULES

**Gap-Based Scoring:**
1. Compare all players' values at each cell
2. Highest value wins (if no tie)
3. Points = gap (highest - second highest)
4. Ties = 0 points

**Example:**
```
You: 5    AI1: 3    AI2: 2
Winner: You
Gap: 5 - 3 = 2
Points: 2
```

**Column Constraint:**
- Numbers 1-5 only once per column
- Zero (0) unlimited
- Invalid moves prevented

---

## TESTING CHECKLIST

- [x] Setup screen renders
- [x] AI opponent selection (2-10)
- [x] Game starts with empty grid
- [x] Quick click cycles values
- [x] Right-click opens radial menu
- [x] Long-press (500ms) opens radial menu
- [x] Radial menu tracks mouse/touch
- [x] Value selection works
- [x] Budget tracking accurate
- [x] Submit button disabled until budget spent
- [x] AI grids generate correctly
- [x] Scoring calculation correct
- [x] Results screen shows rankings
- [x] Grid comparison displays
- [x] Play again resets game
- [x] Mobile touch support
- [x] No timer present

---

## KNOWN ISSUES / TODO

- [ ] Add sound effects (radial menu click, cell placement)
- [ ] Add haptic feedback on mobile
- [ ] Smooth animations for radial menu appearance
- [ ] Show AI strategy labels on results screen
- [ ] Add detailed cell-by-cell breakdown view
- [ ] Export results to CSV/JSON

---

## FILE STRUCTURE

```
src/
├── Demo1PMode.js          ← Main single-player controller
├── Demo1PMode.css         ← Game styling
├── RadialMenu.js          ← Radial value selector
├── RadialMenu.css         ← Radial UI styling
├── GameBoard.js           ← Grid with radial integration
├── App.js                 ← Entry point (renders Demo1PMode)
└── App.css                ← Chrome cell styling
```

---

## NEXT STEPS

This branch demonstrates:
✅ Radial menu input method
✅ Single-player vs AI
✅ No timer requirement
✅ Full game loop (setup → play → results)

**Ready to merge to main** once approved.

**Next demo:** `demo-2p-h2h` (2 players head-to-head, remote play)

---

## GIT COMMANDS

```bash
# View this branch
git log --oneline

# Compare with master
git diff master..demo-1p-mode

# Merge to master (after approval)
git checkout master
git merge demo-1p-mode
```

---

**DEMO COMPLETE!** ✅  
Test at http://localhost:3000
