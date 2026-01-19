
const setupPasswordProtection = () => {
  const gate = document.getElementById("password-gate")

  if (gate) {
    // === CRITICAL FIX: Move gate to body ===
    if (gate.parentElement !== document.body) {
      document.body.appendChild(gate);
    }

    const form = gate.querySelector("form")
    const input = gate.querySelector("input") as HTMLInputElement
    const errorMsg = gate.querySelector(".error-msg")
    const correctPass = gate.dataset.pass
    const passwordId = gate.dataset.id

    const unlock = () => {
      document.body.classList.remove("is-locked")
      document.documentElement.classList.remove("is-locked")
      if (passwordId) {
        sessionStorage.setItem(`quartz-locked-${passwordId}`, "unlocked")
      }
      gate.style.display = "none"
    }

    // Check status on load
    if (passwordId && sessionStorage.getItem(`quartz-locked-${passwordId}`) === "unlocked") {
      unlock()
    } else {
      // Lock
      gate.style.display = "flex" 
      document.body.classList.add("is-locked")
      document.documentElement.classList.add("is-locked")
      
      setTimeout(() => input?.focus(), 100);
    }

    if (form) {
      // Clone to remove old listeners
      const newForm = form.cloneNode(true) as HTMLFormElement
      form.parentNode?.replaceChild(newForm, form)
      
      const newInput = newForm.querySelector("input") as HTMLInputElement

      newForm.addEventListener("submit", (e) => {
        e.preventDefault() 
        
        if (newInput.value === correctPass) {
          unlock()
        } else {
          if (errorMsg) errorMsg.textContent = "Неверный ключ доступа"
          
          const modal = gate.querySelector(".password-modal")
          modal?.animate([
              { transform: 'translateX(0)' },
              { transform: 'translateX(-5px)' },
              { transform: 'translateX(5px)' },
              { transform: 'translateX(0)' }
          ], { duration: 300 })
          
          newInput.value = ""
          newInput.focus()
        }
      })
      
      if (gate.style.display !== "none") {
         newInput?.focus()
      }
    }
  }
}

document.addEventListener("nav", setupPasswordProtection)
setupPasswordProtection()
