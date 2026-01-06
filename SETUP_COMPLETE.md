# GrappleGrid Playtest - Setup Complete! ✅

## 🎮 Your Application is Ready!

**Local Server:** http://localhost:3000

The development server is running and the app has been compiled successfully!

## 📁 What Was Built

### Complete React Application
- **9 source files** created and committed to Git
- Full game implementation with scoring system
- Data collection and export functionality
- Multiple input methods for rapid playtesting
- Responsive UI with gradient styling

### Git Repository Initialized
```
✅ Initial commit: All core files
✅ README with complete documentation
✅ Git reference guide for workflow
```

View your commits:
```bash
cd /home/claude/grapplegrid-playtest
git log --oneline
```

## 🎯 Quick Start Guide

### 1. Access the Application
Open your browser to: **http://localhost:3000**

### 2. Play Your First Game
1. Choose a preset (start with "Standard 5x5")
2. Click "Start Game"
3. Use Click Mode to cycle through values (0-5) in each cell
4. Watch your budget counter - must use all points
5. Remember: Numbers 1-5 can only appear once per column!
6. Click "Finish Setup" when budget is at 0
7. Player 2's turn begins
8. After both players finish, see scores!

### 3. Collect Data
1. Click "📊 Data Collection" button (bottom-right)
2. Play several games with different configurations
3. Click "Export CSV" to download spreadsheet data
4. Open in Excel or Google Sheets to analyze

## 🔧 Making Changes

### Test Different Budgets
```bash
# Create experiment branch
git checkout -b experiment/budget-45

# Edit src/App.js
# Change line 10: budget: 50, to budget: 45,

# Test the changes in browser
# Play multiple games
# Export data

# Commit if you like it
git add .
git commit -m "Test 5x5 with 45pt budget"

# Or discard and go back
git checkout master
```

### Change Scoring Formula
Edit `src/App.js`, find the `calculateScores()` function (around line 75):

```javascript
const gap = winnerValue - secondHighest;
const score = gap * gap;  // ← Change this formula
```

Try:
- `gap` - Linear scoring
- `gap * gap` - Current (gap squared)
- `gap * gap * gap` - Cubic (more dramatic)
- `gap * 2` - Double points

Save, and the browser will auto-reload!

## 📊 Testing Strategy

### Configurations to Test
1. **3x3 @ 20pts** - Tutorial simplicity check
2. **5x5 @ 50pts** - Main competitive balance
3. **5x5 @ 45pts** - Increased budget pressure
4. **5x5 @ 40pts** - Maximum budget pressure
5. **6x6 @ 70pts** - Advanced complexity

### Data to Look For
- Average winning scores (target: 100-200 range?)
- Score gaps (blowouts vs close games)
- Time to complete grid (should be fast)
- Strategic variety (multiple valid approaches)

### Export After Each Configuration
Play 5-10 games per configuration, then export CSV to compare.

## 📝 Git Workflow Cheat Sheet

```bash
# Check what changed
git status
git diff

# Save changes
git add .
git commit -m "Description of what you changed"

# View history
git log --oneline

# Create experiment branch
git checkout -b experiment/scoring-test

# Go back to master
git checkout master

# Merge experiment if successful
git merge experiment/scoring-test

# See detailed git guide
cat GIT_REFERENCE.md
```

## 📂 File Structure

```
grapplegrid-playtest/
├── README.md              ← Full documentation
├── GIT_REFERENCE.md       ← Git command reference
├── package.json           ← Dependencies
├── .gitignore            ← Files to ignore
├── public/
│   └── index.html        ← HTML template
└── src/
    ├── index.js          ← React entry point
    ├── App.js            ← 🎯 Main game logic HERE
    ├── App.css           ← Styling
    ├── GameSettings.js   ← Configuration UI
    ├── GameBoard.js      ← Grid input interface
    ├── ScoreDisplay.js   ← Results display
    └── DataCollector.js  ← CSV/JSON export
```

## 🎓 Key Game Mechanics (Implemented)

### Column Constraint
- Each number 1-5 can appear only ONCE per column
- Zero (0) can be used multiple times
- Red border warning when next value violates this

### Scoring System
- Compare each cell across all player grids
- Highest value wins that cell
- Score = (gap to second place)²
- Ties = 0 points for everyone

### Budget System
- Must allocate entire budget
- No saving points
- Forces strategic sacrifices
- "Finish Setup" button disabled until budget = 0

## 🚀 Next Steps

### Today
1. ✅ Open http://localhost:3000
2. ✅ Play 3-5 games on 5x5 @ 50pts
3. ✅ Export CSV data
4. ✅ Try 5x5 @ 45pts for comparison

### This Week
1. Test all preset configurations
2. Gather data on 20+ games
3. Analyze score distributions
4. Experiment with budget values
5. Try modified scoring formulas

### Next Iterations
1. Add AI opponent (simple random)
2. Add strategy templates
3. Add score history graphs
4. Test multiplayer (3-4 players)
5. Refine based on data

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Kill any running servers
pkill -f react-scripts

# Start fresh
cd /home/claude/grapplegrid-playtest
npm start
```

### Changes Not Showing
- Check the terminal for errors
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R
- Make sure you saved the file!

### Port 3000 Already in Use
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

### Git Confusion
```bash
# See what branch you're on
git status

# Go back to safe master branch
git checkout master

# See all commits
git log --oneline

# Read the reference
cat GIT_REFERENCE.md
```

## 📞 Quick Reference

**Start Server:** `npm start`
**Stop Server:** Ctrl+C
**Git Status:** `git status`
**Git Commit:** `git add . && git commit -m "message"`
**View Files:** `ls -la src/`
**Edit Main Logic:** `src/App.js`

## 🎉 You're All Set!

The application is running, Git is tracking everything, and you're ready to playtest!

Open http://localhost:3000 and start experimenting with different configurations!
