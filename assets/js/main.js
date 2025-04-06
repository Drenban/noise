document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('auth-container');
    const searchPage = document.getElementById('search-page');
    const historyButton = document.querySelector('.history-btn');
    const searchHistory = document.querySelector('.search-history');
    const logoutButton = document.querySelector('.logout-btn');
    const signInForm = document.querySelector('.sign-in-container form');

    const storage = sessionStorage;
    const isLoggedIn = () => storage.getItem("isLoggedIn") === "true";

    if (!container || !searchPage || !logoutButton || !signInForm) {
        console.error("DOM elements not found:", { container, searchPage, logoutButton, signInForm });
        return;
    }

    historyButton.addEventListener('click', () => {
        searchHistory.classList.toggle('visible');
    });

    logoutButton.addEventListener('click', handleLogout);

    signInForm.addEventListener('submit', handleSignIn);

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
            alert('登录成功，欢迎回来！');
        } else {
            alert('登录失败，请检查邮箱或密码是否正确。');
        }
    }

    function handleSignUp(event) {
        event.preventDefault();
        const name = document.querySelector('.sign-up-container input[type="text"]').value;
        const email = document.querySelector('.sign-up-container input[type="email"]').value;
        const password = document.querySelector('.sign-up-container input[type="password"]').value;

        if (name && email && password) {
            alert('注册成功，欢迎加入！请使用您的账户信息登录以继续。');
            container.classList.remove('right-panel-active');
        } else {
            alert('请完整填写所有必填项。');
        }
    }

    function handleLogout() {
        storage.removeItem("isLoggedIn");
        container.classList.remove('hidden');
        searchPage.classList.remove('is-active');
        searchHistory.classList.remove('visible');
    }

    if (isLoggedIn()) {
        container.classList.add('hidden');
        searchPage.classList.add('is-active');
    } else {
        container.classList.remove('hidden');
        searchPage.classList.remove('is-active');
    }
});

window.handleLogout = function() {
    const storage = sessionStorage;
    const container = document.getElementById('auth-container');
    const searchPage = document.getElementById('search-page');
    const searchHistory = document.querySelector('.search-history');

    storage.removeItem("isLoggedIn");
    container.classList.remove('hidden');
    searchPage.classList.remove('is-active');
    searchHistory.classList.remove('visible');
    alert('您已成功退出登录，期待您的再次访问。');
};
