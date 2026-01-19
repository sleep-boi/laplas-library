import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import passwords from "./passwords.json"
import { createHash } from "crypto"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export default (() => {
  const PasswordProtection: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // 1. Ищем тег locked:ID
    const tags = fileData.frontmatter?.tags || []
    const lockedTag = tags.find((tag) => tag.startsWith("locked:"))

    // Если тега нет — компонент не рендерится (и это нормально)
    if (!lockedTag) {
      return null
    }

    const id = lockedTag.split(":")[1]
    const password = (passwords as Record<string, string>)[id]

    // Если для этого ID нет пароля в JSON — не блокируем (чтобы не сломать доступ навсегда)
    if (!password) {
      console.warn(`PasswordProtection: Found tag locked:${id}, but no password in passwords.json`)
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
    if (!container) {
        // Если контейнера нет, значит либо нет тега, либо компонент не загрузился
        // console.log('PasswordProtection: No locked container found on this page.')
        return
    }

    const pageId = container.dataset.id
    const correctHash = container.dataset.hash
    const storageKey = 'quartz_unlocked_' + pageId
    const body = document.body
    
    const input = container.querySelector('.password-input')
    const btn = container.querySelector('.password-submit')
    const err = container.querySelector('.password-error')

    function unlock() {
      console.log('PasswordProtection: Unlocking page...')
      body.classList.remove('is-locked')
      container.style.display = 'none'
    }

    function lock() {
      console.log('PasswordProtection: Locking page...')
      body.classList.add('is-locked')
      container.style.display = 'block'
      if (input) setTimeout(() => input.focus(), 100)
    }

    // Проверка при загрузке
    const isUnlocked = localStorage.getItem(storageKey) === 'true'
    console.log('PasswordProtection status:', isUnlocked ? 'Unlocked' : 'Locked')

    if (isUnlocked) {
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
      
      // Сравниваем хеши
      if (hashed === correctHash) {
        localStorage.setItem(storageKey, 'true')
        unlock()
      } else {
        console.log('PasswordProtection: Wrong password')
        err.style.display = 'block'
        input.value = ''
        input.focus()
        
        // Анимация тряски
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
  /* Блокируем скролл, когда закрыто */
  body.is-locked {
    overflow: hidden !important;
    height: 100vh !important;
  }

  /* ВАЖНО: Убран сложный селектор блюра, который ломал отображение */

  .password-protection-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999; /* Очень высокий Z-index */
    pointer-events: auto;
    display: none; /* Скрыто по умолчанию, скрипт покажет */
  }

  .password-overlay {
    width: 100%;
    height: 100%;
    /* Делаем фон сплошным или сильно размытым, чтобы скрыть контент */
    background-color: var(--light); 
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Темная тема - меняем фон */
  :root[saved-theme="dark"] .password-overlay {
      background-color: var(--dark);
  }

  .password-modal {
    background: var(--light);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 350px;
    width: 90%;
    border: 1px solid var(--lightgray);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    z-index: 100000;
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
    box-sizing: border-box;
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
  }

  .password-modal button:hover {
    background: var(--tertiary);
  }
  `

  return PasswordProtection
}) satisfies QuartzComponentConstructor
