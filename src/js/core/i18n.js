import en from "../../i18n/en.json";
import uk from "../../i18n/uk.json";

const DICTIONARIES = { en, uk };
const STORAGE_KEY = "dt-lang";
const DEFAULT_LANG = "en";

export class I18n {
  constructor() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");

    if (Object.hasOwn(DICTIONARIES, fromUrl)) {
      this.lang = fromUrl;
      localStorage.setItem(STORAGE_KEY, fromUrl);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.lang = Object.hasOwn(DICTIONARIES, saved) ? saved : DEFAULT_LANG;
    }
  }

  translate(key) {
    const value = key.split(".").reduce((obj, part) => obj?.[part], DICTIONARIES[this.lang]);
    return typeof value === "string" ? value : null;
  }

  apply() {
    document.documentElement.lang = this.lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const text = this.translate(el.dataset.i18n);
      if (text !== null) {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split("|").forEach((pair) => {
        const [attr, key] = pair.split(":");
        const text = this.translate(key);
        if (text !== null) {
          el.setAttribute(attr, text);
        }
      });
    });
  }
}