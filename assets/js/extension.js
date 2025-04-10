// quant-mobile-extension.js
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        const quant = document.querySelector(".quant");
        const minimizeBtn = document.querySelector(".quant__intro--minimize");

        const isMobile = window.matchMedia('(max-width: 1000px)').matches;
        if (!isMobile) return;

        // 替换按钮以移除原有事件
        const newMinimizeBtn = minimizeBtn.cloneNode(true);
        minimizeBtn.parentNode.replaceChild(newMinimizeBtn, minimizeBtn);

        // 初始化状态
        let isExpanded = false;
        quant.classList.remove("is-minimized");
        quant.classList.remove("is-expanded");
        newMinimizeBtn.title = "Show Instruction";

        // 点击/触摸处理函数
        function handleToggle(e) {
            e.preventDefault();
            isExpanded = !isExpanded;
            quant.classList.toggle("is-expanded", isExpanded);
            newMinimizeBtn.title = isExpanded ? "Hide Instruction" : "Show Instruction";
            console.log("Toggle triggered, isExpanded:", isExpanded); // 调试日志
        }

        // 绑定事件
        newMinimizeBtn.addEventListener("click", handleToggle);
        newMinimizeBtn.addEventListener("touchstart", handleToggle, { passive: true });

        // 检查 quant 是否可见
        console.log("quant is-visible:", quant.classList.contains("is-visible"));

        // 监听屏幕变化
        window.matchMedia('(max-width: 1000px)').addEventListener("change", (e) => {
            if (e.matches) {
                quant.classList.remove("is-minimized");
                quant.classList.remove("is-expanded");
                newMinimizeBtn.title = "Show Instruction";
                isExpanded = false;
            }
        });
    });
})();
