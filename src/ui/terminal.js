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
  const history = [];
  let historyIndex = -1;

  function print(line = '') {
    term.write(`\r\n${line}`);
  }

  function writePrompt() {
    term.write(`\r\n${getPrompt()} `);
  }

  function writeWelcome() {
    term.write('Cisco CLI Quest Trainer\r\n');
    term.write('Type "help" or "?" for commands.\r\n');
    term.write(`${getPrompt()} `);
  }

  function reset() {
    input = '';
    historyIndex = -1;
    term.reset();
    writeWelcome();
  }

  function replaceInput(nextInput) {
    if (input.length > 0) {
      term.write('\b \b'.repeat(input.length));
    }

    input = nextInput;
    term.write(input);
  }

  function writeCaret(position) {
    const promptOffset = getPrompt().length + 1;
    term.write(`\r\n${' '.repeat(promptOffset + position)}^`);
  }

  writeWelcome();

  term.onData((data) => {
    const char = data;

    if (char === '\u001b[A') {
      if (history.length > 0) {
        historyIndex = historyIndex < 0
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
        replaceInput(history[historyIndex]);
      }
      return;
    }

    if (char === '\u001b[B') {
      if (historyIndex >= 0) {
        historyIndex += 1;
        if (historyIndex >= history.length) {
          historyIndex = -1;
          replaceInput('');
        } else {
          replaceInput(history[historyIndex]);
        }
      }
      return;
    }

    if (char === '\t') {
      const completed = getAutocomplete(input);

      if (completed) {
        replaceInput(completed);
      }

      return;
    }

    if (char === '\r') {
      term.write('\r\n');
      if (input.trim()) {
        history.push(input);
      }
      historyIndex = -1;
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
    fit: () => fitAddon.fit(),
    writeCaret,
    reset
  };
}
