(function () {
  "use strict";

  function createPhoneMarkup(label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modern-iphone-device";
    button.setAttribute("aria-label", label + ". Click to enlarge.");
    button.innerHTML =
      '<span class="modern-iphone-action-dot" aria-hidden="true"></span>' +
      '<span class="modern-iphone-display" aria-hidden="true">' +
      '<span class="modern-iphone-island"></span>' +
      '</span>';
    return button;
  }

  function initializeModernExperiencePhones() {
    const shells = Array.from(
      document.querySelectorAll(".experience-iphone-shell")
    );

    if (!shells.length) return;

    let lastFocusedPhone = null;
    let closeTimer = null;
    let savedScrollY = 0;

    const overlay = document.createElement("div");
    overlay.className = "iphone-zoom-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<button class="iphone-zoom-close" type="button" aria-label="Close enlarged phone">×</button>' +
      '<div class="iphone-zoom-stage" role="dialog" aria-modal="true" aria-label="Enlarged iPhone preview"></div>' +
      '<div class="iphone-zoom-hint">Click the phone or background to close · Esc also works</div>';

    document.body.appendChild(overlay);

    const stage = overlay.querySelector(".iphone-zoom-stage");
    const closeButton = overlay.querySelector(".iphone-zoom-close");

    function copyPhoneVariables(fromElement, toElement) {
      const styles = getComputedStyle(fromElement);
      [
        "--iphone-screen",
        "--iphone-accent",
        "--iphone-accent-dark",
        "--iphone-accent-light"
      ].forEach(function (property) {
        const value = styles.getPropertyValue(property).trim();
        if (value) toElement.style.setProperty(property, value);
      });
    }

    function openPhone(shell, phone) {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      lastFocusedPhone = phone;
      stage.replaceChildren();

      const enlargedPhone = createPhoneMarkup(
        phone.getAttribute("aria-label").replace(". Click to enlarge.", "")
      );
      copyPhoneVariables(shell, enlargedPhone);
      enlargedPhone.setAttribute("aria-label", "Close enlarged iPhone preview");
      enlargedPhone.addEventListener("click", function (event) {
        event.stopPropagation();
        closePhone();
      });

      stage.appendChild(enlargedPhone);
      overlay.classList.remove("is-closing");
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");

      savedScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.top = `-${savedScrollY}px`;
      document.body.classList.add("iphone-zoom-active");

      window.requestAnimationFrame(function () {
        closeButton.focus({ preventScroll: true });
      });
    }

    function closePhone() {
      if (!overlay.classList.contains("is-open")) return;

      overlay.classList.add("is-closing");
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("iphone-zoom-active");
      document.body.style.top = "";
      window.scrollTo(0, savedScrollY);

      closeTimer = window.setTimeout(function () {
        stage.replaceChildren();
        overlay.classList.remove("is-closing");
        if (lastFocusedPhone && document.contains(lastFocusedPhone)) {
          lastFocusedPhone.focus({ preventScroll: true });
        }
      }, 240);
    }

    shells.forEach(function (shell, index) {
      const role = shell
        .closest(".experience-card")
        ?.querySelector(".experience-role")
        ?.textContent
        ?.trim();

      const group = shell.closest(".experience-iphone-strip");
      const groupShells = group
        ? Array.from(group.querySelectorAll(".experience-iphone-shell"))
        : shells;

      const position = Math.max(1, groupShells.indexOf(shell) + 1);
      const label = (role || "Portfolio preview") + " — phone " + position;

      shell.replaceChildren();
      const phone = createPhoneMarkup(label);
      shell.appendChild(phone);

      phone.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        openPhone(shell, phone);
      });
    });

    closeButton.addEventListener("click", function (event) {
      event.stopPropagation();
      closePhone();
    });

    stage.addEventListener("click", function (event) {
      if (event.target === stage) closePhone();
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closePhone();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closePhone();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeModernExperiencePhones,
      { once: true }
    );
  } else {
    initializeModernExperiencePhones();
  }
})();
