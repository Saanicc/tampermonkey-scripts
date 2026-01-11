// ==UserScript==
// @name         YouTube Grid Changer (Multi-Res)
// @namespace    https://github.com/Saanicc/tampermonkey-scripts/blob/master/custom-youtube-grid.js
// @version      2026-01-11
// @description  Allows user to change the number of videos per row on YouTube Home for various screen sizes
// @author       Saanicc
// @match        https://www.youtube.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Saanicc/tampermonkey-scripts/refs/heads/master/custom-youtube-grid.js
// @downloadURL  https://raw.githubusercontent.com/Saanicc/tampermonkey-scripts/refs/heads/master/custom-youtube-grid.js
// ==/UserScript==

(function () {
  "use strict";

  const yt_row_1700_2100 = "yt_row_1700_2100";
  const yt_row_2101_2560 = "yt_row_2101_2560";
  const yt_row_2561_3000 = "yt_row_2561_3000";
  const yt_row_3000_plus = "yt_row_3000_plus";

  const DEFAULT_NUMBER_OF_ROWS = {
    yt_row_1700_2100: 4,
    yt_row_2101_2560: 5,
    yt_row_2561_3000: 6,
    yt_row_3000_plus: 7,
  };

  let val_1700 = GM_getValue(
    yt_row_1700_2100,
    DEFAULT_NUMBER_OF_ROWS[yt_row_1700_2100]
  );
  let val_2100 = GM_getValue(
    yt_row_2101_2560,
    DEFAULT_NUMBER_OF_ROWS[yt_row_2101_2560]
  );
  let val_2500 = GM_getValue(
    yt_row_2561_3000,
    DEFAULT_NUMBER_OF_ROWS[yt_row_2561_3000]
  );
  let val_3000 = GM_getValue(
    yt_row_3000_plus,
    DEFAULT_NUMBER_OF_ROWS[yt_row_3000_plus]
  );

  function applyStaticFixes() {
    const styleId = "yt-grid-static-fixes";
    if (document.getElementById(styleId)) return;

    const styleTag = document.createElement("style");
    styleTag.id = styleId;
    styleTag.textContent = `
            /* Fix margins for first column to prevent left-side gap */
            ytd-rich-item-renderer[rendered-from-rich-grid][is-in-first-column] {
                margin-left: calc(var(--ytd-rich-grid-item-margin) / 2) !important;
            }
            /* Center the grid content */
            #contents.ytd-rich-grid-renderer {
                justify-content: center !important;
            }
            /* Allow container to expand to full width */
            ytd-rich-grid-renderer #contents {
                max-width: 100% !important;
            }
            ytd-rich-item-renderer[rendered-from-rich-grid] {
                max-width: 100% !important;
            }
        `;
    document.head.appendChild(styleTag);
  }

  function updateGridCSS() {
    const styleId = "yt-grid-dynamic-settings";
    let styleTag = document.getElementById(styleId);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const genVars = (count) => `
            --ytd-rich-grid-items-per-row: ${count} !important;
            --ytd-rich-grid-posts-per-row: ${count} !important;
            --ytd-rich-grid-slim-items-per-row: ${count} !important;
            --ytd-rich-grid-game-cards-per-row: ${count} !important;
        `;

    styleTag.textContent = `
            @media only screen and (min-width: 1700px) and (max-width: 2100px) {
                ytd-rich-grid-renderer { ${genVars(val_1700)} }
            }

            @media only screen and (min-width: 2101px) and (max-width: 2560px) {
                ytd-rich-grid-renderer { ${genVars(val_2100)} }
            }

            @media only screen and (min-width: 2561px) and (max-width: 3000px) {
                ytd-rich-grid-renderer { ${genVars(val_2500)} }
            }

            @media only screen and (min-width: 3001px) {
                ytd-rich-grid-renderer { ${genVars(val_3000)} }
            }
        `;
  }

  function updateCurrentValue(storageKey, number) {
    GM_setValue(storageKey, number);

    if (storageKey === yt_row_1700_2100) val_1700 = number;
    if (storageKey === yt_row_2101_2560) val_2100 = number;
    if (storageKey === yt_row_2561_3000) val_2500 = number;
    if (storageKey === yt_row_3000_plus) val_3000 = number;
  }

  function createMenu(label, currentVal, storageKey) {
    GM_registerMenuCommand(label, function () {
      const input = prompt(
        `${label}\nCurrent value: ${currentVal}`,
        currentVal
      );
      const number = parseInt(input, 10);

      if (!isNaN(number) && number > 0) {
        updateCurrentValue(storageKey, number);
        updateGridCSS();
      }
    });
  }

  function resetToDefault() {
    const input = prompt(
      "Are you sure you want to reset to default?\nEnter 'YES' to confirm."
    );

    if (input === "YES") {
      Object.keys(DEFAULT_NUMBER_OF_ROWS).map((objKey) => {
        const defaultValue = DEFAULT_NUMBER_OF_ROWS[objKey];
        updateCurrentValue(objKey, defaultValue);
        updateGridCSS();
      });
    }
  }

  createMenu("Set Row Count (1700px - 2100px)", val_1700, yt_row_1700_2100);
  createMenu("Set Row Count (2101px - 2560px)", val_2100, yt_row_2101_2560);
  createMenu("Set Row Count (2561px - 3000px)", val_2500, yt_row_2561_3000);
  createMenu("Set Row Count (> 3000px)", val_3000, yt_row_3000_plus);

  GM_registerMenuCommand("Reset to default", () => {
    resetToDefault();
  });

  new MutationObserver(function () {
    if (document.getElementById("contents")) {
      applyStaticFixes();
      updateGridCSS();
      this.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
})();
