const gate = document.getElementById("password-gate")

if (gate) {
  const form = gate.querySelector("form")
  const input = gate.querySelector("input") as HTMLInputElement
  const errorMsg = gate.querySelector(".error-msg")
  const correctPass = gate.dataset.pass
  const passwordId = gate.dataset.id

  // Функция разблокировки
  const unlock = () => {
    document.body.classList.remove("is-locked")
    sessionStorage.setItem(`quartz-locked-${passwordId}`, "unlocked")
    gate.style.display = "none" // Скрываем шторку
  }

  // Проверка при загрузке (на случай, если JS загрузился позже inline-скрипта)
  if (sessionStorage.getItem(`quartz-locked-${passwordId}`) === "unlocked") {
    unlock()
  }

  // Обработка формы
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault() // <--- ЭТО САМОЕ ГЛАВНОЕ (отменяет перезагрузку)
      
      if (input.value === correctPass) {
        unlock()
      } else {
        if (errorMsg) errorMsg.textContent = "Incorrect password"
        
        // Анимация тряски
        const modal = gate.querySelector(".password-modal")
        modal?.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 })
        
        input.value = ""
        input.focus()
      }
    })
  }
}
