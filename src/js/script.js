import Finder from "./finder.js";

class app {
  constructor() {
    new Finder(10);
    this.initPages();
  }

  delateActiveClass(elements) {
    elements.forEach((elem) => elem.classList.remove("active"));
  }

  initPages() {
    const mainNav = document.querySelector(".main-nav");

    mainNav.addEventListener("click", (e) => {
      const clickedElement = e.target;
      if (clickedElement.tagName !== "A") return;

      this.delateActiveClass(mainNav.querySelectorAll("a"));

      const href = clickedElement.getAttribute("href").slice(1);

      clickedElement.classList.add("active");
      const page = document.querySelector(`.${href}`);

      this.delateActiveClass(document.querySelectorAll(".page"));

      page.classList.add("active");
    });
  }
}

new app();
