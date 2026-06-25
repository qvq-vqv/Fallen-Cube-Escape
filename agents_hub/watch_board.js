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
    const match = content.match(/> \*\*当前项目状态\*\*:\s*`\[STATUS:\s*([^\]]+)\]`/);
    if (match) {
      const status = match[1].trim();
      if (status === 'WAITING_FOR_QA' || status === 'WAITING_FOR_PLAN_REVIEW') {
        console.log(`Status changed to ${status}. Exiting to wake up Antigravity...`);
        process.exit(0);
      }
    }
  } catch (err) {
    console.error('Error reading board:', err);
  }
  setTimeout(check, 5000);
}

check();
