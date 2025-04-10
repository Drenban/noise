// quant-mobile-extension.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const quant = document.querySelector(".quant");
    const quantIntro = document.querySelector(".quant__intro");
    const minimizeBtn = document.querySelector(".button-icon.quant__intro--minimize"); // 与 HTML 匹配

    const isMobile = window.matchMedia("(max-width: 1000px)");

    // 容错处理
    if (!quant || !quantIntro || !minimizeBtn) {
      console.warn("Missing elements - quant:", !!quant, "quantIntro:", !!quantIntro, "minimizeBtn:", !!minimizeBtn);
      return;
    }

    if (!isMobile.matches) return;

    // 替换按钮
    const newMinimizeBtn = minimizeBtn.cloneNode(true);
    minimizeBtn.replaceWith(newMinimizeBtn);

    // 默认状态
    let isExpanded = false;
    quant.classList.remove("is-minimized");
    quantIntro.classList.remove("is-expanded");
    newMinimizeBtn.title = "Show Instruction";
    quant.classList.add("is-visible");

    // 处理函数
    function handleToggle(e) {
      e.preventDefault();
      isExpanded = !isExpanded;
      quantIntro.classList.toggle("is-expanded", isExpanded);
      newMinimizeBtn.title = isExpanded ? "Hide Instruction" : "Show Instruction";
      console.log("Toggle triggered:", isExpanded);
      console.log("quant__intro classes:", quantIntro.className);
    }

    // 绑定事件
    newMinimizeBtn.addEventListener("click", handleToggle);
    newMinimizeBtn.addEventListener("touchstart", handleToggle, { passive: true });

    // 屏幕变化监听
    isMobile.addEventListener("change", (e) => {
      if (e.matches) {
        quant.classList.remove("is-minimized");
        quantIntro.classList.remove("is-expanded");
        newMinimizeBtn.title = "Show Instruction";
        isExpanded = false;
        quant.classList.add("is-visible");
        console.log("Screen resized: Reset to collapsed state");
      }
    });

    // 调试信息
    console.log("quant is-visible:", quant.classList.contains("is-visible"));
    console.log("Button events bound:", newMinimizeBtn.onclick !== null || "Using addEventListener");
    console.log("Initial quant__intro classes:", quantIntro.className);
  });
})();
