// auth.js
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');
const searchPage = document.getElementById('search-page');

const storage = sessionStorage;
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
        storage.setItem("isLoggedIn", "true");
        container.style.display = 'none';
        searchPage.classList.add('is-active');
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
        container.classList.remove('right-panel-active');
    } else {
        alert('请填写所有字段');
    }
}

// 退出登录
function handleLogout() {
    storage.removeItem("isLoggedIn");
    container.style.display = 'block';
    searchPage.classList.remove('is-active');
    alert('已退出登录！');
}

// 初始化检查
if (isLoggedIn()) {
    container.style.display = 'none';
    searchPage.classList.add('is-active');
} else {
    container.style.display = 'block';
    searchPage.classList.remove('is-active');
}
