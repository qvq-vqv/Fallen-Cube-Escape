const fs = require('fs');
const path = require('path');

const boardPath = path.join(__dirname, 'CODEX_BOARD.md');

console.log('Watching board:', boardPath);

function check() {
  if (!fs.existsSync(boardPath)) {
    setTimeout(check, 5000);
    return;
  }
  try {
    const content = fs.readFileSync(boardPath, 'utf8');
    if (content.includes('[STATUS: WAITING_FOR_QA]') || content.includes('[STATUS: WAITING_FOR_PLAN_REVIEW]')) {
      console.log('Status changed to WAITING_FOR_QA or WAITING_FOR_PLAN_REVIEW. Exiting to wake up Antigravity...');
      process.exit(0);
    }
  } catch (err) {
    console.error('Error reading board:', err);
  }
  setTimeout(check, 5000);
}

check();
