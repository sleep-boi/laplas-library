import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import passwords from "./passwords.json"
import { createHash } from "crypto"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

const PasswordProtection: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const tags = fileData.frontmatter?.tags || []
  const lockedTag = tags.find((tag) => tag.startsWith("locked:"))

  if (!lockedTag) {
    return null
  }

  const id = lockedTag.split(":")[1]
  const password = passwords[id]

  if (!password) {
    return null 
  }

  const passwordHash = hashPassword(password)

  return (
    <div class="password-protection-container">
      <div class="password-overlay">
        <div class="password-modal">
          <h2>Restricted Access</h2>
          <p>This page is protected. Please enter the password.</p>
          <input type="password" id="password-input" placeholder="Password" />
          <button id="password-submit">Unlock</button>
          <p id="password-error" style="color: red; display: none; margin-top: 10px;">Incorrect password</p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          const correctHash = "${passwordHash}";
          const pageId = "${id}";
          const storageKey = 'quartz_unlocked_' + pageId;

          // Check status immediately
          if (sessionStorage.getItem(storageKey) === 'true') {
             // Already unlocked
          } else {
             document.body.classList.add('is-locked');
          }

          async function sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
          }

          document.addEventListener('DOMContentLoaded', () => {
             // Re-check just in case, though script runs after parsing
             if (sessionStorage.getItem(storageKey) !== 'true') {
                 document.body.classList.add('is-locked');
             }

             const btn = document.getElementById('password-submit');
             const input = document.getElementById('password-input');
             const err = document.getElementById('password-error');

             if (!btn || !input) return;

             async function checkPassword() {
                const val = input.value;
                const hashed = await sha256(val);
                if (hashed === correctHash) {
                    sessionStorage.setItem(storageKey, 'true');
                    document.body.classList.remove('is-locked');
                } else {
                    err.style.display = 'block';
                }
             }

             btn.addEventListener('click', checkPassword);
             input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkPassword();
             });
          });
        })();
      `}} />
    </div>
  )
}

PasswordProtection.css = `
body.is-locked {
  overflow: hidden;
}

body.is-locked #quartz-body {
  filter: blur(20px);
  pointer-events: none;
  user-select: none;
}

.password-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

body.is-locked .password-overlay {
  display: flex;
}

.password-modal {
  background: var(--light);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 400px;
  width: 90%;
  border: 1px solid var(--lightgray);
}

.password-modal h2 {
  margin-top: 0;
  color: var(--dark);
}

.password-modal p {
  color: var(--darkgray);
}

.password-modal input {
  display: block;
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  border: 1px solid var(--gray);
  border-radius: 4px;
  background: var(--light);
  color: var(--dark);
  font-size: 1rem;
}

.password-modal button {
  background: var(--secondary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.2s;
}

.password-modal button:hover {
  background: var(--tertiary);
}
`

export default (() => PasswordProtection) satisfies QuartzComponentConstructor
