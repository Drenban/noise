// quant-mobile-extension.js
(function() {
    // 等待 DOM 加载完成
    document.addEventListener("DOMContentLoaded", function() {
        // 获取必要元素
        const quant = document.querySelector(".quant");
        const minimizeBtn = document.querySelector(".quant__intro--minimize");

        // 检查是否为手机端
        const isMobile = window.matchMedia('(max-width: 1000px)').matches;
        if (!isMobile) return; // 非手机端，直接退出

        // 移除原有 click 事件（避免重复触发）
        minimizeBtn.removeEventListener("click", x); // 注意：这里的 x 需要与原始函数引用一致
        // 如果无法直接引用原始 x，可通过克隆节点移除所有事件
        const newMinimizeBtn = minimizeBtn.cloneNode(true);
        minimizeBtn.parentNode.replaceChild(newMinimizeBtn, minimizeBtn);

        // 初始化手机端状态
        let isExpanded = false;
        quant.classList.remove("is-minimized"); // 移除桌面端状态
        quant.classList.remove("is-expanded"); // 确保默认折叠
        newMinimizeBtn.title = "Show Instruction"; // 默认提示展开

        // 定义手机端点击/触摸处理函数
        function handleToggle(e) {
            e.preventDefault(); // 防止默认行为
            isExpanded = !isExpanded;
            quant.classList.toggle("is-expanded", isExpanded);
            newMinimizeBtn.title = isExpanded ? "Hide Instruction" : "Show Instruction";
        }

        // 绑定新的事件
        newMinimizeBtn.addEventListener("click", handleToggle);
        newMinimizeBtn.addEventListener("touchstart", handleToggle, { passive: true });

        // 动态调整（监听屏幕大小变化）
        window.matchMedia('(max-width: 1000px)').addEventListener("change", (e) => {
            if (e.matches) {
                // 进入手机端
                quant.classList.remove("is-minimized");
                quant.classList.remove("is-expanded");
                newMinimizeBtn.title = "Show Instruction";
                isExpanded = false;
            }
        });
    });
})();
