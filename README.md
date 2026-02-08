# GrappleGrid Playtest Application

A React-based playtesting environment for GrappleGrid game design.

## Features

- **Multiple Grid Sizes**: Testing "board" sizes input: "___x___" possible 3x3, 4x4, default is 5x5, 6x6 7x7 max sizegrids
- **Variable Budgets**: Adjust "point budgets" as variable "bank$=" related to size board. 50 points default. 
console variable=10-110 range to test balance
- **Multi-player Support**: Up to 4 players (AI players, all controlled by console) 
--number of games= sets=__ x match=__ = total game rounds
- **


## Quick Start

```bash
npm start
```



## Game Presets

- **Tutorial (3x3)**: 20 point budget - for onboarding
- **Training (4x4)**: 35 point budget
- **Standard (5x5)**: 50 point budget - main competitive mode
- **Advanced (6x6)**: 70 point budget

## How to Play

1. **Setup**: Choose grid size, budget, and number of players
2. **Placement Phase**: Each player (simultaneous ) secretly allocates points to grid
   - Must use entire point budget
   - Column constraint: 1-5 only once per column (0 can repeat)

3. **ScoringLOGIC**: Grids are compared cell-by-cell
   - methodolgies variable to choose one logic
1. straight Highest value-lowest in each cell 
2. highest value difference average of other players in square
3. 
4
5
  - Score = (gap)² between winner and second place
   - Ties = 0 points for everyone in that cell

STRATEGY TACTICAL PRESETS: ai define behavior play style: adjust to score logic
A) aggressive=
B) balanced=
C) conservative=
D) defensive=
E) human logical=
F) human illogical
G) variable: random a-f choice

 

- **Gap-Squared Scoring**: Winner = highest value, score = (gap)²




input restrictions obey column constraints, points zerosum spending on total
### Paint Mode
- Select a value (0-5) from the palette
- Click cells to "paint" that value
- Great for filling multiple cells quickly

### Keyboard
- Click to focus a cell
- Press 0-5 to set value directly
- Tab to move between cells

## Data Collection

The app automatically tracks all games played:

1. **View Statistics**: Click "📊 Data Collection" in bottom-right
2. **Export CSV**: For spreadsheet analysis (Excel, Google Sheets)
3. **Export JSON**: For detailed programmatic analysis

### CSV Data Includes:
- Timestamp, grid size, budget, number of players
- Winner, scores, score gaps
- Winning margin percentage
- Total cells

### JSON Data Includes:
- Complete grid layouts for all players
- Cell-by-cell scoring breakdown
- Gap calculations per cell

## Git Workflow

### View History
```bash
git log --oneline
git log --graph --all --decorate
```

### Check Status
```bash
git status
git diff
```

### Make Changes and Commit
```bash
# After making changes to files
git add .
git commit -m "Description of changes"
```

### Create Branches for Features
```bash
# Create and switch to new branch
git checkout -b feature/ai-opponent

# Work on feature, commit changes
git add .
git commit -m "Add AI opponent logic"

# Switch back to master
git checkout master

# Merge feature when ready
git merge feature/ai-opponent
```

### View Changes Between Versions
```bash
# See what changed in a file
git diff HEAD src/App.js

# Compare two commits
git diff 3c64504 HEAD

# Restore old version of file
git checkout 3c64504 -- src/App.js
```

### Undo Changes
```bash
# Discard uncommitted changes
git checkout -- src/App.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Testing Strategy

### Grid Size Testing
1. Test 3x3 with 20pt budget (should be simple, tutorial-appropriate)
2. Test 5x5 with 50pt budget (main competitive balance)
3. Test 5x5 with 40pt budget (forced sacrifices)
4. Test 6x6 with 70pt budget (advanced complexity)

### Data to Track
- Average winning scores per configuration
- Score distribution (close games vs blowouts)
- Common strategies (spreading vs clustering)
- Column constraint impact on decisions
- Budget pressure points

### Questions to Answer
- Which grid/budget combo has best strategic depth?
- Are there dominant strategies?
- What's the ideal score range for exciting games?
- How does score gap scale with grid size?

## File Structure

```
grapplegrid-playtest/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── App.js              # Main game logic & state
│   ├── App.css             # Styling
│   ├── GameSettings.js     # Configuration UI
│   ├── GameBoard.js        # Grid input interface
│   ├── ScoreDisplay.js     # Results visualization
│   ├── DataCollector.js    # Export functionality
│   └── index.js            # React entry point
├── package.json
├── .gitignore
└── README.md
```

## Next Steps

1. **Start Server**: `npm start`
2. **Play Test Games**: Try different configurations
3. **Export Data**: Download CSV after 10+ games
4. **Analyze**: Look for balance issues
5. **Iterate**: Adjust budgets/scoring in code
6. **Commit Changes**: Use git to track iterations

## Development Notes

### Adjusting Game Balance

**Change Budget** (`src/App.js`):
```javascript
const [gameSettings, setGameSettings] = useState({
  gridSize: 5,
  budget: 50,  // ← Adjust this
  numPlayers: 2
});
```

**Change Scoring Formula** (`src/App.js`, `calculateScores()` function):
```javascript
const gap = winnerValue - secondHighest;
const score = gap * gap;  // ← Modify formula here
// Could try: gap, gap * gap, gap * gap * gap, etc.
```

**Add Position Multipliers**:
```javascript
const positionMultiplier = getPositionMultiplier(row, col);
const score = gap * gap * positionMultiplier;
```

## Troubleshooting

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

**Changes not showing:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache and reload

**Git conflicts:**
```bash
# See what conflicts exist
git status

# Abort merge if needed
git merge --abort

# Or manually resolve conflicts in files and then:
git add .
git commit -m "Resolved merge conflicts"
```

## Contributing

When making changes:

1. Create a feature branch
2. Test thoroughly with multiple games
3. Export and review data
4. Commit with descriptive message
5. Merge back to master when stable

Example:
```bash
git checkout -b experiment/budget-reduction
# Make changes, test, export data
git add .
git commit -m "Reduce 5x5 budget from 50 to 45 - increases tension"
git checkout master
git merge experiment/budget-reduction
```
