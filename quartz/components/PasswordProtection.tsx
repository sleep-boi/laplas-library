import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import passwords from "./passwords.json"
import { createHash } from "crypto"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export default (() => {
  const PasswordProtection: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // Check for "locked:id" tag
    const tags = fileData.frontmatter?.tags || []
    const lockedTag = tags.find((tag) => tag.startsWith("locked:"))

    if (!lockedTag) {
      return null
    }

    const id = lockedTag.split(":")[1]
    const password = (passwords as Record<string, string>)[id]

    // If no password defined for this ID, do not lock (or you could choose to lock by default)
    if (!password) {
      return null 
    }

    const passwordHash = hashPassword(password)

    return (
      <div class="password-protection-container" data-id={id} data-hash={passwordHash}>
        <div class="password-overlay">
          <div class="password-modal">
            <h2>🔒 Restricted Access</h2>
            <p>This content is protected. Please enter the password to view.</p>
            <input type="password" class="password-input" placeholder="Enter Password" />
            <button class="password-submit">Unlock</button>
            <p class="password-error" style="display: none; color: #e5484d; margin-top: 10px; font-size: 0.9rem;">Incorrect password</p>
          </div>
        </div>
      </div>
    )
  }

  PasswordProtection.afterDOMLoaded = `
    const container = document.querySelector('.password-protection-container')
    if (!container) return

    const pageId = container.dataset.id
    const correctHash = container.dataset.hash
    const storageKey = 'quartz_unlocked_' + pageId
    const body = document.body
    
    const overlay = container.querySelector('.password-overlay')
    const input = container.querySelector('.password-input')
    const btn = container.querySelector('.password-submit')
    const err = container.querySelector('.password-error')

    // Helper to lock/unlock
    function unlock() {
      body.classList.remove('is-locked')
      container.style.display = 'none'
    }

    function lock() {
      body.classList.add('is-locked')
      container.style.display = 'block'
      // Focus input specifically if it's visible
      if (input) setTimeout(() => input.focus(), 100)
    }

    // Check status immediately on load
    if (localStorage.getItem(storageKey) === 'true') {
      unlock()
    } else {
      lock()
    }

    async function sha256(message) {
      const msgBuffer = new TextEncoder().encode(message)
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    async function checkPassword() {
      const val = input.value
      const hashed = await sha256(val)
      if (hashed === correctHash) {
        localStorage.setItem(storageKey, 'true')
        unlock()
      } else {
        err.style.display = 'block'
        input.value = ''
        input.focus()
        // Shake animation effect
        const modal = container.querySelector('.password-modal')
        modal.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)' }
        ], { duration: 300 })
      }
    }

    if (btn) btn.addEventListener('click', checkPassword)
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword()
      })
    }
  `

  PasswordProtection.css = `
  body.is-locked {
    overflow: hidden;
    height: 100vh;
  }

  /* Blur all direct children of body EXCEPT the password container */
  /* This is more robust than selecting #quartz-body */
  body.is-locked > *:not(.password-protection-container) {
    filter: blur(15px);
    pointer-events: none;
    user-select: none;
  }

  .password-protection-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    pointer-events: auto;
  }

  .password-overlay {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .password-modal {
    background: var(--light);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 350px;
    width: 90%;
    border: 1px solid var(--lightgray);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .password-modal h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--dark);
  }

  .password-modal p {
    margin: 0;
    color: var(--darkgray);
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .password-modal input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--gray);
    border-radius: 6px;
    background: var(--light);
    color: var(--dark);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .password-modal input:focus {
    border-color: var(--secondary);
  }

  .password-modal button {
    background: var(--secondary);
    color: var(--light);
    border: none;
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: background 0.2s, transform 0.1s;
  }

  .password-modal button:hover {
    background: var(--tertiary);
  }

  .password-modal button:active {
    transform: scale(0.98);
  }
  `

  return PasswordProtection
}) satisfies QuartzComponentConstructor

