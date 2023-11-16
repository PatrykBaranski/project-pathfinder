class Modal {
  constructor(parameters) {
    this.parameters = parameters;
    this.getHTML();
    this.insertParameters();
    this.openModal();
    this.initCloseModal();
  }

  getHTML() {
    this.modalBackground = document.querySelector(".modal-background");
    this.modal = document.querySelector(".modal");
    this.fullElem = document.querySelector(".full");
    this.longestElem = document.querySelector(".longest");
    this.shortestElem = document.querySelector(".shortest");
    this.closeBtn = document.querySelector(".close-modal");
  }

  insertParameters() {
    const { parameters, longestElem, shortestElem, fullElem } = this;
    [fullElem, shortestElem, longestElem].forEach(
      (elem, i) => (elem.querySelector(".number").textContent = parameters[i])
    );
  }

  openModal() {
    const { modalBackground, modal } = this;
    [modalBackground, modal].forEach((elem) => elem.classList.add("active"));
  }

  initCloseModal() {
    const { closeBtn, modalBackground, modal } = this;
    [closeBtn, modalBackground].forEach((elem) =>
      elem.addEventListener("click", () => {
        modalBackground.classList.remove("active");
        modal.classList.remove("active");
      })
    );
  }
}

export default Modal;
