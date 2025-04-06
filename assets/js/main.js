// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('auth-container');
    const searchPage = document.getElementById('search-page');
    const historyButton = document.querySelector('.history-btn');
    const searchHistory = document.querySelector('.search-history');

    const storage = sessionStorage;
    const isLoggedIn = () => storage.getItem("isLoggedIn") === "true";

    // 历史按钮开关功能
    historyButton.addEventListener('click', () => {
        searchHistory.classList.toggle('visible');
    });

    signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
    });

    function handleSignIn(event) {
        event.preventDefault();
        const email = document.querySelector('.sign-in-container input[type="email"]').value;
        const password = document.querySelector('.sign-in-container input[type="password"]').value;

        if (email === 'user@example.com' && password === 'password') {
            storage.setItem("isLoggedIn", "true");
            container.classList.add('hidden');
            searchPage.classList.add('is-active');
            alert('登录成功！');
        } else {
            alert('邮箱或密码错误');
        }
    }

    function handleSignUp(event) {
        event.preventDefault();
        const name = document.querySelector('.sign-up-container input[type="text"]').value;
        const email = document.querySelector('.sign-up-container input[type="email"]').value;
        const password = document.querySelector('.sign-up-container input[type="password"]').value;

        if (name && email && password) {
            alert('注册成功！请使用您的账户登录');
            container.classList.remove('right-panel-active');
        } else {
            alert('请填写所有字段');
        }
    }

    function handleLogout() {
        storage.removeItem("isLoggedIn");
        container.classList.remove('hidden');
        searchPage.classList.remove('is-active');
        searchHistory.classList.remove('visible'); // 登出时隐藏历史记录
        alert('已退出登录！');
    }

    // 初始化
    if (isLoggedIn()) {
        container.classList.add('hidden');
        searchPage.classList.add('is-active');
    } else {
        container.classList.remove('hidden');
        searchPage.classList.remove('is-active');
    }
});
