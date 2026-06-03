import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export function createTerminal({
  terminalElement,
  getPrompt,
  runCommand,
  getAutocomplete
}) {
  const term = new Terminal({
    cursorBlink: true,
    fontSize: 16,
    fontFamily: 'Consolas, monospace',
    theme: {
      background: '#0b0f14',
      foreground: '#d7e1ea',
    },
  });

  const fitAddon = new FitAddon();

  term.loadAddon(fitAddon);
  term.open(terminalElement);

  requestAnimationFrame(() => {
    fitAddon.fit();
  });

  window.addEventListener('resize', () => {
    fitAddon.fit();
  });

  let input = '';

  function print(line = '') {
    term.write(`\r\n${line}`);
  }

  function writePrompt() {
    term.write(`\r\n${getPrompt()} `);
  }

  term.write('Cisco CLI Quest Trainer\r\n');
  term.write('Type "help" or "?" for commands.\r\n');
  term.write(`${getPrompt()} `);

  term.onData((data) => {
    const char = data;

    if (char === '\t') {
      const completed = getAutocomplete(input);

      if (completed) {
        const remaining = completed.slice(input.length);
        input = completed;
        term.write(remaining);
      }

      return;
    }

    if (char === '\r') {
      term.write('\r\n');
      runCommand(input);
      input = '';
      writePrompt();

      requestAnimationFrame(() => {
        fitAddon.fit();
      });

      return;
    }

    if (char === '\u007F') {
      if (input.length > 0) {
        input = input.slice(0, -1);
        term.write('\b \b');
      }
      return;
    }

    input += char;
    term.write(char);
  });

  return {
    term,
    print,
    writePrompt,
    fit: () => fitAddon.fit()
  };
}