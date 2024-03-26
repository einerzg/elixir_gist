// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//
import hljs from 'highlight.js';
// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import 'phoenix_html';
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from 'phoenix';
import { LiveSocket } from 'phoenix_live_view';
import topbar from '../vendor/topbar';

function updateLineNumbers(value) {
  const lineNumberText = document.querySelector('#line-numbers');

  if (!lineNumberText) return;

  const lines = value.split('\n');

  const numbers = lines.map((_, index) => index + 1).join('\n') + '\n';

  lineNumberText.value = numbers;
}

const Hook = {};

Hook.Highligth = {
  mounted() {
    let name = this.el.getAttribute('data-name');
    let codeBlock = this.el.querySelector('pre code');
    if (codeBlock) {
      codeBlock.className = codeBlock.className.replace(/language-\S+/g, '');
      codeBlock.classList.add(`language-${this.getSyntaxType(name)}`);
      codeBlock.textContent = this.trimCodeBlock(codeBlock.textContent);
      hljs.highlightElement(codeBlock);
      updateLineNumbers(codeBlock.textContent);
    }
  },
  getSyntaxType(name) {
    let extension = name.split('.').pop();
    switch (extension) {
      case 'text':
        return 'text';
      case 'json':
        return 'json';
      case 'heex':
        return 'html';
      case 'html':
        return 'html';
      case 'js':
        return 'javascript';
      default:
        return 'elixir';
    }
  },
  trimCodeBlock(content) {
    const lines = content.split('\n');
    if (lines.length > 2) {
      lines.shift();
      lines.pop();
    }
    return lines.join('\n');
  }
};

Hook.EventTextarea = {
  mounted() {
    this.el.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = this.el.selectionStart;
        const end = this.el.selectionEnd;
        this.el.value =
          this.el.value.substring(0, start) +
          '\t' +
          this.el.value.substring(end);
        this.el.selectionStart = this.el.selectionEnd = start + 1;
      }
    });
  }
};

Hook.CopyToClipboard = {
  mounted() {
    this.el.addEventListener('click', (e) => {
      const textToCopy = this.el.getAttribute('data-clickboar-gist');
      if (textToCopy) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            console.log('Copy successfull');
          })
          .catch((err) => {
            console.log('Error', err);
          });
      }
    });
  }
};

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute('content');
let liveSocket = new LiveSocket('/live', Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
  hooks: Hook
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: '#29d' }, shadowColor: 'rgba(0, 0, 0, .3)' });
window.addEventListener('phx:page-loading-start', (_info) => topbar.show(300));
window.addEventListener('phx:page-loading-stop', (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;
