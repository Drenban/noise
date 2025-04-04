const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');

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

  // 示例验证逻辑（需替换为后端请求）
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

  // 示例验证逻辑（需替换为后端请求）
  if (name && email && password) {
    localStorage.setItem("isLoggedIn", "true");
    hideAuthContainer();
    alert('注册成功！');
    container.classList.remove('right-panel-active'); // 切换回登录面板
  } else {
    alert('请填写所有字段');
  }
}

// 隐藏登录/注册界面并初始化 quantCode
function hideAuthContainer() {
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.style.display = 'none';
    // 触发 quantCode 初始化（假设使用模块加载器）
    if (typeof require === 'function') {
      require(['./quantCode'], function(quantCode) {
        quantCode.init();
      });
    } else {
      console.error('RequireJS not available, ensure quantCode is accessible');
    }
  }
}

// 初始化时检查登录状态
if (isLoggedIn()) {
  hideAuthContainer();
}
