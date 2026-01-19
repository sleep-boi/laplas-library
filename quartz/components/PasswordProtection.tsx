import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/passwordProtection.inline"
// @ts-ignore
import style from "./styles/passwordProtection.scss"
import passwords from "./passwords.json"

interface PasswordMap {
  [key: string]: string
}

const PasswordProtection: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  // Читаем password_id из фронтметтера
  const passwordId = fileData.frontmatter?.password_id as string | undefined
  if (!passwordId) return null

  const passwordMap = passwords as PasswordMap
  const password = passwordMap[passwordId]

  if (!password) return null

  // Этот скрипт выполняется мгновенно, чтобы скрыть контент до загрузки React/JS
  const inlineCheck = `
    (function() {
      var pid = "${passwordId}";
      // Если в сессии нет метки "unlocked", вешаем класс блокировки на body
      if (sessionStorage.getItem("quartz-locked-" + pid) !== "unlocked") {
        document.body.classList.add("is-locked");
      }
    })();
  `

  return (
    <div id="password-gate" data-id={passwordId} data-pass={password} class={displayClass}>
      <script dangerouslySetInnerHTML={{ __html: inlineCheck }} />
      <div class="password-modal">
        <div class="lock-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2>Restricted Access</h2>
        <p>This note is password protected.</p>
        <form>
          <input type="password" placeholder="Enter Password" autoFocus />
          <button type="submit">Unlock</button>
        </form>
        <div class="error-msg"></div>
      </div>
    </div>
  )
}

PasswordProtection.afterDOMLoaded = script
PasswordProtection.css = style

export default (() => PasswordProtection) satisfies QuartzComponentConstructor
