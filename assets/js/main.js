// auth.js
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');
const shaderQuant = document.getElementById('shader-quant');
const shaderQuantCm = document.getElementById('shader-quant-cm');

// 检查登录状态
const isLoggedIn = () => localStorage.getItem("isLoggedIn") === "true";

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
        localStorage.setItem("isLoggedIn", "true");
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
        localStorage.setItem("isLoggedIn", "true");
        hideAuthContainer();
        alert('注册成功！');
        container.classList.remove('right-panel-active');
    } else {
        alert('请填写所有字段');
    }
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
    shaderQuant.classList.add('is-active');
    shaderQuantCm.classList.add('is-active');
}
