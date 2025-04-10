// quant-mobile-extension.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const quant = document.querySelector(".quant");
    const quantIntro = document.querySelector(".quant__intro");
    const minimizeBtn = document.querySelector(".button-icon.quant__intro--minimize");

    const isMobile = window.matchMedia("(max-width: 1000px)");

    // 容错处理：确保关键元素存在
    if (!quant || !quantIntro || !minimizeBtn) {
      console.warn("quant / quantIntro / minimizeBtn not found");
      return;
    }

    // 如果不是移动端则直接返回
    if (!isMobile.matches) return;

    // 替换按钮以移除原有绑定事件
    const newMinimizeBtn = minimizeBtn.cloneNode(true);
    minimizeBtn.replaceWith(newMinimizeBtn); // 更简洁的替换方式

    // 默认折叠状态
    let isExpanded = false;
    quant.classList.remove("is-minimized");
    quantIntro.classList.remove("is-expanded");
    newMinimizeBtn.title = "Show Instruction";

    // 显示 quant（因为默认 pointer-events: none）
    quant.classList.add("is-visible");

    // 切换展开/折叠状态的处理函数
    function handleToggle(e) {
      e.preventDefault();
      isExpanded = !isExpanded;
      quantIntro.classList.toggle("is-expanded", isExpanded);
      newMinimizeBtn.title = isExpanded ? "Hide Instruction" : "Show Instruction";

      console.log("Toggle triggered:", isExpanded);
      console.log("quant__intro classes:", quantIntro.className);
    }

    // 添加事件监听（touchstart 支持移动端点击）
    newMinimizeBtn.addEventListener("click", handleToggle);
    newMinimizeBtn.addEventListener("touchstart", handleToggle, { passive: true });

    // 屏幕尺寸变化时自动重置为默认状态
    isMobile.addEventListener("change", (e) => {
      if (e.matches) {
        quant.classList.remove("is-minimized");
        quantIntro.classList.remove("is-expanded");
        newMinimizeBtn.title = "Show Instruction";
        isExpanded = false;
        quant.classList.add("is-visible");
        console.log("Screen resized: Reset to default collapsed state");
      }
    });

    // 调试信息
    console.log("quant is-visible:", quant.classList.contains("is-visible"));
    console.log("Button ready and events bound");
    console.log("Initial quant__intro classes:", quantIntro.className);
  });
})();
