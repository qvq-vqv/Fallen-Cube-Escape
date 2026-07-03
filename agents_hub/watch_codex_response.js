const fs = require('fs');
const path = require('path');

const boardPath = path.join(__dirname, 'CODEX_BOARD.md');

console.log('🤖 Antigravity CEO Board Watcher started.');
console.log('Watching board for handover to CEO/Antigravity...');

function check() {
  if (!fs.existsSync(boardPath)) {
    setTimeout(check, 5000);
    return;
  }
  try {
    const content = fs.readFileSync(boardPath, 'utf8');
    
    // Robust regex that ignores markdown stars around labels and colons
    const senderMatch = content.match(/发信人\s*\(Sender\)[*\s]*:[*\s]*(.+)/i);
    const nextActionMatch = content.match(/接棒人\s*\(Next\s*Action\)[*\s]*:[*\s]*(.+)/i);
    
    if (senderMatch && nextActionMatch) {
      const sender = senderMatch[1].trim();
      const nextAction = nextActionMatch[1].trim();
      
      // We ONLY wake up when the Next Action is handed back to CEO or Antigravity
      if (nextAction.toLowerCase().includes('ceo') || nextAction.toLowerCase().includes('antigravity')) {
        console.log(`\n🎉 Detected handover! Sender: ${sender}. Next Action is: ${nextAction}`);
        console.log('Waking up Antigravity CEO...');
        process.exit(0);
      }
    }
  } catch (err) {
    console.error('Error reading board:', err);
  }
  setTimeout(check, 5000); // Poll every 5 seconds
}

check();
