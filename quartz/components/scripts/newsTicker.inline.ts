
const setupNewsTicker = () => {
  const container = document.getElementById('news-ticker-container');
  const closeBtn = document.getElementById('news-ticker-close');
  
  if (!container) return;

  const isClosed = sessionStorage.getItem('quartz-news-closed');
  
  if (isClosed === 'true') {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex'; // Restore display if it was hidden
    container.classList.add('visible');
  }

  if (closeBtn) {
    // Clone to remove old listeners
    const newBtn = closeBtn.cloneNode(true)
    closeBtn.parentNode?.replaceChild(newBtn, closeBtn)

    newBtn.addEventListener('click', () => {
      container.style.display = 'none';
      sessionStorage.setItem('quartz-news-closed', 'true');
    });
  }
}

document.addEventListener("nav", setupNewsTicker)
setupNewsTicker()
