// quant-mobile-extension.js
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        const quant = document.querySelector(".quant");
        const minimizeBtn = document.querySelector(".button-icon.quant__intro--minimize"); // 更新选择器

        const isMobile = window.matchMedia('(max-width: 1000px)').matches;
        if (!isMobile) return;

        // 替换按钮
        const newMinimizeBtn = minimizeBtn.cloneNode(true);
        minimizeBtn.parentNode.replaceChild(newMinimizeBtn, minimizeBtn);

        // 初始化状态
        let isExpanded = false;
        quant.classList.remove("is-minimized");
        quant.classList.remove("is-expanded");
        newMinimizeBtn.title = "Show Instruction";

        // 强制添加 .is-visible
        if (!quant.classList.contains("is-visible")) {
            quant.classList.add("is-visible");
            console.log("Forced adding is-visible to .quant");
        }

        // 处理函数
        function handleToggle(e) {
            e.preventDefault();
            isExpanded = !isExpanded;
            quant.classList.toggle("is-expanded", isExpanded);
            newMinimizeBtn.title = isExpanded ? "Hide Instruction" : "Show Instruction";
            console.log("Toggle triggered, isExpanded:", isExpanded);
        }

        // 绑定事件
        newMinimizeBtn.addEventListener("click", handleToggle);
        newMinimizeBtn.addEventListener("touchstart", handleToggle, { passive: true });

        // 调试信息
        console.log("quant is-visible:", quant.classList.contains("is-visible"));
        console.log("Button events bound:", newMinimizeBtn.onclick !== null);
        console.log("Button classes:", newMinimizeBtn.className);

        // 屏幕变化监听
        window.matchMedia('(max-width: 1000px)').addEventListener("change", (e) => {
            if (e.matches) {
                quant.classList.remove("is-minimized");
                quant.classList.remove("is-expanded");
                newMinimizeBtn.title = "Show Instruction";
                isExpanded = false;
                quant.classList.add("is-visible");
            }
        });
    });
})();
