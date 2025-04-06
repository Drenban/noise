// auth.js
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');
const searchPage = document.getElementById('search-page');

const storage = sessionStorage;
const isLoggedIn = () => storage.getItem("isLoggedIn") === "true";

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
        container.style.display = 'none'; // 隐藏登录罩子
        searchPage.style.display = 'block'; // 显示搜索罩子
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
    container.style.display = 'block'; // 显示登录罩子
    searchPage.style.display = 'none'; // 隐藏搜索罩子
    alert('已退出登录！');
}

// 初始化检查
if (isLoggedIn()) {
    container.style.display = 'none';
    searchPage.style.display = 'block';
} else {
    container.style.display = 'block';
    searchPage.style.display = 'none';
}
