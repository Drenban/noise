// auth.js
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');
const shaderQuant = document.getElementById('shader-quant');
const shaderQuantCm = document.getElementById('shader-quant-cm');

// 检查是否为测试模式（通过 URL 参数）
const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true';

// 动态选择存储方式：测试模式用 sessionStorage，生产模式仍用 sessionStorage（避免持久登录）
const storage = sessionStorage; // 统一使用 sessionStorage，确保刷新后退出

// 检查登录状态
const isLoggedIn = () => storage.getItem("isLoggedIn") === "true";

// 切换到注册表单
signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

// 切换到登录表单
signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

// 处理登录
function handleSignIn(event) {
    event.preventDefault();
    const email = document.querySelector('.sign-in-container input[type="email"]').value;
    const password = document.querySelector('.sign-in-container input[type="password"]').value;

    if (email === 'user@example.com' && password === 'password') {
        storage.setItem("isLoggedIn", "true"); // 设置登录状态（会话有效）
        hideAuthContainer();
        alert('登录成功！');
    } else {
        alert('邮箱或密码错误');
    }
}

// 处理注册
function handleSignUp(event) {
    event.preventDefault();
    const name = document.querySelector('.sign-up-container input[type="text"]').value;
    const email = document.querySelector('.sign-up-container input[type="email"]').value;
    const password = document.querySelector('.sign-up-container input[type="password"]').value;

    if (name && email && password) {
        alert('注册成功！请使用您的账户登录');
        container.classList.remove('right-panel-active'); // 返回登录页面
    } else {
        alert('请填写所有字段');
    }
}

// 退出登录
function handleLogout() {
    storage.removeItem("isLoggedIn"); // 清除登录状态
    container.style.display = 'block'; // 显示登录界面
    shaderQuant.classList.add('is-active');
    shaderQuantCm.classList.add('is-active');
    alert('已退出登录！');
}

// 隐藏登录/注册界面
function hideAuthContainer() {
    if (container) {
        container.style.display = 'none';
        shaderQuant.classList.remove('is-active');
        shaderQuantCm.classList.remove('is-active');
        if (typeof require === 'function') {
            require(['./quantCode'], function(quantCode) {
                quantCode.init();
            });
        }
    }
}

// 初始化检查
if (isLoggedIn()) {
    hideAuthContainer();
} else {
    container.style.display = 'block'; // 确保初始显示
    shaderQuant.classList.add('is-active');
    shaderQuantCm.classList.add('is-active');
}

// 绑定退出按钮（假设页面有 <button onclick="handleLogout()">退出登录</button>）
