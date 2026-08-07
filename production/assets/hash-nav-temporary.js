// Temporary: keep same-page section links out of the app router until the
// navigation points to interior pages.
document.addEventListener(
  "click",
  (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest('a[href^="#"]');

    if (!link?.hash) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.replace(link.hash);
  },
  true,
);
