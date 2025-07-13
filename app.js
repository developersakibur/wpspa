document.addEventListener('DOMContentLoaded', () => {
  const siteUrl = new URL(window.location.href).origin;
  const contentEl = document.querySelector('#app-content');
  const loaderEl = document.querySelector('#loader');
  const sidebar = document.querySelector('#spa-sidebar');
  const pageCache = {}; // In-memory cache

  const loadStyles = (doc) => {
    const newStyles = doc.querySelectorAll('link[rel="stylesheet"]');
    newStyles.forEach(newStyle => {
      const styleExists = document.querySelector(`link[href="${newStyle.href}"]`);
      if (!styleExists) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = newStyle.id;
        link.href = newStyle.href;
        link.media = newStyle.media;
        document.head.appendChild(link);
      }
    });
  };

  const updatePageDOM = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Dynamically load stylesheets
    loadStyles(doc);

    const newContent = doc.querySelector('#app-content');
    if (!newContent) {
      console.error('Could not find #app-content in fetched HTML.');
      contentEl.innerHTML = 'Error: Failed to load content.';
      return;
    }
    const newTitleEl = newContent.querySelector('#page-title');
    const newTitle = newTitleEl ? newTitleEl.textContent : doc.title;
    document.title = newTitle;
    if (newTitleEl) newTitleEl.remove();
    contentEl.innerHTML = newContent.innerHTML;
    contentEl.scrollTop = 0;

    // Re-initialize Elementor widgets if Elementor is active
    // Use a timeout to ensure styles are applied before scripts run
    setTimeout(() => {
        if (window.elementorFrontend && typeof window.elementorFrontend.init === 'function') {
            window.elementorFrontend.init();
        }
    }, 100);
  };

  const loadPage = (url, isPopState = false) => {
    loaderEl.style.display = 'block';
    contentEl.style.opacity = '0.5';

    // Bypass cache for logged-in users to ensure they see fresh content
    const isUserLoggedIn = document.body.classList.contains('logged-in');

    if (pageCache[url] && !isUserLoggedIn) {
      updatePageDOM(pageCache[url]);
      if (!isPopState) {
        history.pushState({ path: url }, document.title, url);
      }
      loaderEl.style.display = 'none';
      contentEl.style.opacity = '1';
      return;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(html => {
        if (!isUserLoggedIn) {
            pageCache[url] = html; // Cache the fetched HTML
        }
        updatePageDOM(html);
        if (!isPopState) {
          history.pushState({ path: url }, document.title, url);
        }
      })
      .catch(error => {
        console.error('Failed to fetch page:', error);
        window.location.href = url; // Fallback to full page load on error
      })
      .finally(() => {
        loaderEl.style.display = 'none';
        contentEl.style.opacity = '1';
      });
  };

  document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    // Prevent page reload for submenu toggles
    if (sidebar.contains(link) && link.getAttribute('href') === '#') {
      e.preventDefault();
      return;
    }

    // Handle internal links for SPA navigation
    if (link.href.startsWith(siteUrl) && !link.target && link.href !== window.location.href && link.getAttribute('href') !== '#') {
      e.preventDefault();
      loadPage(link.getAttribute('href'));
    }
  });

  window.addEventListener('popstate', e => {
    if (e.state && e.state.path) {
      loadPage(e.state.path, true);
    }
  });

  // Set initial state
  history.replaceState({ path: window.location.href }, document.title, window.location.href);
});
