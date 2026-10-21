(() => {
  "use strict";
  const toggle = document.getElementById("apparatus-label-toggle");
  const labels = document.querySelectorAll("[data-apparatus-labels]");
  const views = [...document.querySelectorAll(".apparatus-view")];
  if (!toggle) return;
  function positionLabels() {
    views.forEach(view => {
      const image = view.querySelector("img");
      const box = image.getBoundingClientRect();
      if (!image.naturalWidth || !box.width || !box.height) return;
      const style = getComputedStyle(image);
      const scale = style.objectFit === "cover"
        ? Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight)
        : Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
      const [positionX, positionY] = style.objectPosition.split(" ").map(value => parseFloat(value) / 100);
      const offsetX = (box.width - image.naturalWidth * scale) * positionX;
      const offsetY = (box.height - image.naturalHeight * scale) * positionY;
      view.querySelectorAll(".apparatus-pin").forEach(pin => {
        const x = parseFloat(pin.style.getPropertyValue("--pin-x")) / 100;
        const y = parseFloat(pin.style.getPropertyValue("--pin-y")) / 100;
        pin.style.left = `${(x * image.naturalWidth * scale + offsetX) / box.width * 100}%`;
        pin.style.top = `${(y * image.naturalHeight * scale + offsetY) / box.height * 100}%`;
      });
    });
  }
  function updateLabels() {
    labels.forEach(label => { label.hidden = !toggle.checked; });
    if (toggle.checked) positionLabels();
  }
  toggle.addEventListener("change", updateLabels);
  views.forEach(view => view.querySelector("img").addEventListener("load", positionLabels));
  document.querySelector(".apparatus-angle").addEventListener("toggle", positionLabels);
  window.addEventListener("resize", positionLabels);
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(positionLabels);
    views.forEach(view => observer.observe(view.querySelector("img")));
  }
  updateLabels();
})();
