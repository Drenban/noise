// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('auth-container');
    const searchPage = document.getElementById('search-page');
    const historyButton = document.querySelector('.history-btn');
    const searchHistory = document.querySelector('.search-history');
    const logoutButton = document.querySelector('.logout-btn');
    const signInForm = document.querySelector('.sign-in-container form');
    const signUpForm = document.querySelector('.sign-up-container form');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.querySelector('.search-btn');
    const randomButton = document.querySelector('.random-btn');
    const resultsList = document.getElementById('results-list');
    const historyList = document.getElementById('history-list');

    let userData = null;
    let workbookData = null;
    let corpus = null;
    let fuse = null;
    const searchCache = new Map();
    window.searchHistory = [];

    const storage = sessionStorage;

    // Supabase 配置
    const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';

    function getSupabaseClient() {
        if (typeof supabase === 'undefined') {
            console.error('Supabase 未加载，请确保已引入 Supabase 客户端库');
            return null;
        }
        return supabase.createClient(supabaseUrl, supabaseKey);
    }

    // 检查 DOM 元素
    if (!container || !searchPage || !logoutButton || !signInForm || !signUpForm || !searchInput || !searchButton || !randomButton || !resultsList || !historyList) {
        console.error("DOM elements not found:", { container, searchPage, logoutButton, signInForm, signUpForm, searchInput, searchButton, randomButton, resultsList, historyList });
        return;
    }

    // Base64 解码函数
    function decodeBase64UTF8(base64Str) {
        try {
            const binaryStr = atob(base64Str);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            return new TextDecoder('utf-8').decode(bytes);
        } catch (error) {
            throw new Error('Base64 解码失败: ' + error.message);
        }
    }

    // 加载 JSON 数据
    async function loadJSONData() {
        try {
            const response = await fetch('/assets/data/encrypted_data.json');
            if (!response.ok) throw new Error('无法加载 JSON 数据');
            const encryptedData = await response.text();
            const decodedData = decodeBase64UTF8(encryptedData);
            workbookData = JSON.parse(decodedData);
            console.log('JSON 数据加载完成');
        } catch (error) {
            console.error('加载 JSON 数据失败:', error);
            resultsList.innerHTML = '<li>服务器繁忙，请稍后再试</li>';
        }
    }

    // 加载语料库
    async function loadCorpus() {
        try {
            const response = await fetch('/assets/data/encrypted_corpus.json');
            if (!response.ok) throw new Error(`无法加载语料库: ${response.status}`);
            const encryptedData = await response.text();
            const decodedData = decodeBase64UTF8(encryptedData);
            corpus = JSON.parse(decodedData);

            fuse = new Fuse(corpus, {
                keys: [
                    { name: 'question', weight: 0.5 },
                    { name: 'keywords', weight: 0.3 },
                    { name: 'synonyms', weight: 0.15 },
                    { name: 'tags', weight: 0.05 }
                ],
                threshold: 0.4,
                includeScore: true,
                includeMatches: true,
                minMatchCharLength: 2,
                shouldSort: true
            });
            console.log('语料库加载完成');
        } catch (error) {
            console.error('加载语料库失败:', error);
        }
    }

    // 搜索 JSON 数据
    function searchJSON(query) {
        resultsList.innerHTML = '';

        if (!workbookData) {
            resultsList.innerHTML = '<li>服务器繁忙，请稍后再试</li>';
            return false;
        }

        const conditions = {};
        let isSimpleQuery = false;
        let name, age;

        query = query.trim().toLowerCase();
        if (query.includes(':')) {
            query.split(',').forEach(part => {
                const [key, value] = part.split(':').map(s => s.trim());
                if (key && value !== undefined) conditions[key] = value;
            });
            name = conditions['celv'] || conditions['策略'];
            age = conditions['shoupanjia'] || conditions['收盘价'];
            if (name && age && Object.keys(conditions).length === 2) isSimpleQuery = true;
        } else if (/[，, ]/.test(query)) {
            const parts = query.split(/[，, ]+/).map(s => s.trim());
            if (parts.length === 2) {
                isSimpleQuery = true;
                if (/^\d+$/.test(parts[0])) {
                    age = parts[0];
                    name = parts[1];
                } else {
                    name = parts[0];
                    age = parts[1];
                }
                conditions['策略'] = name;
                conditions['收盘价'] = age;
            }
        } else if (/^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query) || /^\d+[\u4e00-\u9fa5a-zA-Z]+$/.test(query)) {
            isSimpleQuery = true;
            if (/^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query)) {
                name = query.match(/[\u4e00-\u9fa5a-zA-Z]+/)[0];
                age = query.match(/\d+/)[0];
            } else {
                age = query.match(/\d+/)[0];
                name = query.match(/[\u4e00-\u9fa5a-zA-Z]+/)[0];
            }
            conditions['策略'] = name;
            conditions['收盘价'] = age;
        } else if (/^\d+$/.test(query)) {
            conditions['股票代码'] = query;
        } else {
            conditions[''] = query;
        }

        const matches = workbookData.filter(row => {
            if (conditions['']) {
                return Object.values(row).some(val => 
                    String(val).toLowerCase().includes(conditions[''])
                );
            }
            return Object.entries(conditions).every(([key, value]) => {
                const rowValue = String(row[key] || '').toLowerCase();
                if (!value) return true;
                if (value.includes('-')) {
                    const [min, max] = value.split('-').map(Number);
                    const numValue = Math.floor(Number(rowValue));
                    return numValue >= min && numValue <= max;
                } else if (value.startsWith('>')) {
                    return Math.floor(Number(rowValue)) > Number(value.slice(1));
                } else if (value.startsWith('<')) {
                    return Math.floor(Number(rowValue)) < Number(value.slice(1));
                }
                if (key.toLowerCase() === '收盘价') {
                    return Math.floor(Number(rowValue)) === Math.floor(Number(value));
                }
                return rowValue === value;
            });
        });

        if (matches.length === 0) {
            return false;
        }

        let lines;
        if (isSimpleQuery) {
            const codes = matches.map(row => row['股票代码']).filter(code => code !== undefined);
            lines = [
                `<span class="field">全部代码:</span><br><span class="value">${codes.join(', ')}</span>`,
                `<span class="field">合计:</span> <span class="value">${codes.length}</span>`
            ];
        } else {
            lines = matches.flatMap((result, index) => {
                const resultLines = Object.entries(result).map(([key, value]) => 
                    `<span class="field">${key}:</span> <span class="value">${value}</span>`
                );
                return index < matches.length - 1 ? [...resultLines, '<hr>'] : resultLines;
            });
        }
        return lines;
    }

    // 随机选取符合买入条件的品种
    function getRandomBuy() {
        if (!workbookData) {
            resultsList.innerHTML = '<li>数据未加载，请稍后再试</li>';
            return;
        }

        const buyCandidates = workbookData.filter(row => Number(row['收盘价']) > 10);
        if (buyCandidates.length === 0) {
            resultsList.innerHTML = '<li>未找到符合买入条件的品种</li>';
            return;
        }

        const randomItem = buyCandidates[Math.floor(Math.random() * buyCandidates.length)];
        resultsList.innerHTML = `<li>${Object.entries(randomItem).map(([k, v]) => `<span class="field">${k}:</span> <span class="value">${v}</span>`).join('<br>')}</li>`;
        window.searchHistory.unshift(`随机: ${randomItem['策略'] || randomItem['股票代码']}`);
        updateHistory();
    }

    // 搜索语料库
    function searchCorpus(query) {
        resultsList.innerHTML = '';

        if (!corpus || !fuse) {
            return '语料库未加载，请稍后再试';
        }

        const input = query.trim().toLowerCase();
        if (searchCache.has(input)) {
            return searchCache.get(input);
        }

        const results = fuse.search(input);
        const bestMatch = results.length > 0 && results[0].score < 0.6 ? results[0] : null;
        const intent = detectIntent(input);
        const answer = generateResponse(intent, bestMatch);

        searchCache.set(input, answer);
        return answer;
    }

    // 检测意图
    function detectIntent(input) {
        const lowerInput = input.toLowerCase().replace(/\s+/g, ' ').trim();
        const intents = [
            { name: 'time', patterns: ['时间', '什么时候', '几点', '多久', '啥时候', '何时'], fallback: '您想知道什么的时间？可以告诉我更多细节吗？' },
            { name: 'price', patterns: ['价格', '多少钱', '费用', '成本', '价位', '花多少'], fallback: '您想了解哪方面的价格？可以具体一点吗？' },
            { name: 'howto', patterns: ['如何', '怎么', '怎样', '步骤', '方法', '怎么办'], fallback: '您想知道如何做什么？请告诉我具体操作！' },
            { name: 'psychology', patterns: ['心理', '心态', '情绪', '行为'], fallback: '您想了解交易中的什么心理因素？请具体点！' }
        ];

        for (const intent of intents) {
            if (intent.patterns.some(pattern => lowerInput.includes(pattern))) {
                return intent;
            }
        }
        return null;
    }

    // 生成响应
    function generateResponse(intent, match) {
        if (match) {
            const score = (1 - match.score).toFixed(2);
            if (score < 0.5) return '抱歉，找不到准确答案，您可以换个说法试试！';
            return `${match.item.answer.trim()}`;
        }
        if (intent) {
            switch (intent.name) {
                case 'time': return '我可以帮您查时间相关的信息，您具体想知道什么时间？';
                case 'price': return '价格信息可能因产品不同而异，您想了解哪个产品的价格？';
                case 'howto': return '我可以指导您完成操作，请告诉我您想做什么！';
                default: return intent.fallback || '抱歉，我不太明白您的意思，可以换个说法试试吗？';
            }
        }
        return '抱歉，我不太明白您的意思，可以换个说法试试吗？';
    }

    // 显示结果的打字效果
    function typeLines(lines, element) {
        if (!element) return;
        let lineIndex = 0;
        let charIndex = 0;

        function typeNext() {
            if (lineIndex < lines.length) {
                const lineDivs = element.querySelectorAll('.line');
                let currentLine = lineDivs[lineIndex];
                if (!currentLine) {
                    currentLine = document.createElement('div');
                    currentLine.className = 'line';
                    element.appendChild(currentLine);
                }
                const lineContent = lines[lineIndex] || '';
                if (charIndex < lineContent.length) {
                    currentLine.innerHTML = lineContent.slice(0, charIndex + 1);
                    charIndex++;
                    setTimeout(typeNext, 20);
                    element.scrollTop = element.scrollHeight;
                } else {
                    charIndex = 0;
                    lineIndex++;
                    setTimeout(typeNext, 300);
                }
            }
        }
        typeNext();
    }

    // 更新搜索历史
    function updateHistory() {
        historyList.innerHTML = '';
        window.searchHistory.slice(0, 10).forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.addEventListener('click', () => {
                searchInput.value = item;
                PeekXAuth.search();
            });
            historyList.appendChild(li);
        });
    }

    // 密码哈希
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 生成 token
    function generateToken(username) {
        const salt = crypto.randomUUID();
        const payload = { username, exp: Date.now() + 3600000, salt }; // 1小时有效期
        localStorage.setItem('salt', salt);
        return btoa(JSON.stringify(payload));
    }

    // 检查会员有效期
    function isMembershipValid(expiryDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        return expiry.getTime() > currentDate.getTime() && !isNaN(expiry.getTime());
    }

    // 输入清理
    function sanitizeInput(input) {
        return input.replace(/[<>&;"]/g, '');
    }

    // 验证 token
    function verifyToken(token) {
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            return false;
        }
        try {
            let payload;
            if (token.includes('.')) {
                const [, payloadBase64] = token.split('.');
                payload = JSON.parse(atob(payloadBase64));
                payload.exp = payload.exp * 1000;
            } else {
                payload = JSON.parse(atob(token));
            }

            if (!payload.exp || payload.exp < Date.now()) {
                localStorage.removeItem('token');
                localStorage.removeItem('salt');
                return false;
            }

            if (!token.includes('.')) {
                const storedSalt = localStorage.getItem('salt');
                if (!payload.salt || payload.salt !== storedSalt) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('salt');
                    return false;
                }
            }
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            return false;
        }
    }

    // 加载用户数据（JSON）
    async function loadUserData(username) {
        try {
            const response = await fetch(`/assets/users/${username}.json`);
            if (response.status === 404) return false;
            if (!response.ok) throw new Error(`Failed to fetch /assets/users/${username}.json`);
            const encryptedData = await response.text();
            const decodedData = decodeBase64UTF8(encryptedData);
            userData = JSON.parse(decodedData);
            return userData;
        } catch (error) {
            console.error('加载用户数据失败:', error);
            return false;
        }
    }

    const PeekXAuth = {
        async login(event) {
            event.preventDefault();
            const email = sanitizeInput(document.querySelector('.sign-in-container input[type="email"]').value.trim());
            const password = sanitizeInput(document.querySelector('.sign-in-container input[type="password"]').value.trim());

            const supabaseClient = getSupabaseClient();
            let supabaseSuccess = false;

            // 首先检查 Supabase
            if (supabaseClient) {
                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (!error && data.user) {
                        const expiryDate = data.user.user_metadata?.expiry_date;
                        if (!expiryDate || !isMembershipValid(expiryDate)) {
                            alert('您的会员已过期或未设置有效期，请续费');
                            localStorage.setItem('expiredEmail', email);
                            setTimeout(() => window.location.href = '/peekx/payment/index.html', 2000);
                            return false;
                        }
                        localStorage.setItem('session', JSON.stringify(data.session));
                        localStorage.setItem('token', data.session.access_token);
                        storage.setItem("isLoggedIn", "true");
                        container.classList.add('hidden');
                        searchPage.classList.add('is-active');
                        alert('登录成功（Supabase），欢迎回来！');
                        loadJSONData();
                        loadCorpus();
                        supabaseSuccess = true;
                        return true;
                    } else {
                        console.warn('Supabase 登录失败:', error?.message);
                    }
                } catch (err) {
                    console.error('Supabase 登录错误:', err);
                }
            } else {
                console.warn('Supabase 客户端未初始化，跳过 Supabase 验证');
            }

            // 如果 Supabase 失败或不可用，检查 JSON 文件
            if (!supabaseSuccess) {
                const userData = await loadUserData(email);
                if (!userData) {
                    alert('用户不存在或网络错误');
                    return false;
                }

                const hashedPassword = await hashPassword(password);
                if (userData.username === email && userData.password === hashedPassword) {
                    const expiryDate = userData.expiry_date;
                    if (!expiryDate || !isMembershipValid(expiryDate)) {
                        alert('您的会员已过期或未设置有效期，请续费');
                        localStorage.setItem('expiredEmail', email);
                        setTimeout(() => window.location.href = '/peekx/payment/index.html', 2000);
                        return false;
                    }
                    const token = generateToken(email);
                    localStorage.setItem('token', token);
                    storage.setItem("isLoggedIn", "true");
                    container.classList.add('hidden');
                    searchPage.classList.add('is-active');
                    alert('登录成功（JSON），欢迎回来！');
                    loadJSONData();
                    loadCorpus();
                    return true;
                } else {
                    alert('登录失败，请检查邮箱或密码是否正确。');
                    return false;
                }
            }
        },

        async register(event) {
            event.preventDefault();
            const name = sanitizeInput(document.querySelector('.sign-up-container input[type="text"]').value.trim());
            const email = sanitizeInput(document.querySelector('.sign-up-container input[type="email"]').value.trim());
            const password = sanitizeInput(document.querySelector('.sign-up-container input[type="password"]').value.trim());

            const supabaseClient = getSupabaseClient();
            if (!supabaseClient) {
                alert('Supabase 未加载，无法注册');
                return false;
            }

            if (!name || !email || !password) {
                alert('请完整填写所有必填项。');
                return false;
            }

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // 默认7天有效期
            const expiryDateString = expiryDate.toISOString().split('T')[0];

            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: { data: { expiry_date: expiryDateString, full_name: name } }
                });

                if (error) {
                    alert('注册失败: ' + error.message);
                    return false;
                } else {
                    alert(data.user 
                        ? `注册成功！用户 ID: ${data.user.id}，7天有效期已设置: ${expiryDateString}`
                        : `注册成功，请检查邮箱验证！7天有效期已设置: ${expiryDateString}`);
                    container.classList.remove('right-panel-active');
                    return true;
                }
            } catch (err) {
                alert('注册错误: ' + err.message);
                return false;
            }
        },

        async search() {
            const token = localStorage.getItem('token');
            if (!verifyToken(token)) {
                container.classList.remove('hidden');
                searchPage.classList.remove('is-active');
                alert('请先登录');
                return;
            }

            const query = searchInput.value.trim();
            if (!query) return;

            resultsList.innerHTML = '';

            const isJSONQuery = query.includes(':') ||
                (/[，, ]/.test(query) && query.split(/[，, ]+/).length === 2 &&
                    (/\d/.test(query.split(/[，, ]+/)[0]) || /\d/.test(query.split(/[，, ]+/)[1]))) ||
                /^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query) ||
                /^\d+[\u4e00-\u9fa5a-zA-Z]+$/.test(query) ||
                /^\d+$/.test(query);

            if (isJSONQuery) {
                const jsonResult = searchJSON(query);
                if (jsonResult) {
                    typeLines(jsonResult, resultsList);
                    if (!window.searchHistory.includes(query)) {
                        window.searchHistory.unshift(query);
                        updateHistory();
                    }
                    return;
                }
            }

            const corpusResult = searchCorpus(query);
            if (typeof corpusResult !== 'string') {
                typeLines(['抱歉，查询出错，请稍后再试'], resultsList);
                return;
            }
            const lines = corpusResult.split('\n').filter(line => line.trim());
            typeLines(lines, resultsList);
            if (!window.searchHistory.includes(query)) {
                window.searchHistory.unshift(query);
                updateHistory();
            }
        },

        logout() {
            const supabaseClient = getSupabaseClient();
            if (supabaseClient) {
                supabaseClient.auth.signOut().catch(err => console.error('Supabase 退出失败:', err));
            }
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            storage.removeItem("isLoggedIn");
            container.classList.remove('hidden');
            searchPage.classList.remove('is-active');
            searchHistory.classList.remove('visible');
            alert('您已成功退出登录，期待您的再次访问。');
        }
    };

    // 事件监听器
    historyButton.addEventListener('click', () => {
        searchHistory.classList.toggle('visible');
    });

    logoutButton.addEventListener('click', PeekXAuth.logout);

    signInForm.addEventListener('submit', PeekXAuth.login);

    signUpForm.addEventListener('submit', PeekXAuth.register);

    signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
    });

    searchButton.addEventListener('click', PeekXAuth.search);

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') PeekXAuth.search();
    });

    randomButton.addEventListener('click', getRandomBuy);

    // 初始化
    if (storage.getItem("isLoggedIn") === "true" && verifyToken(localStorage.getItem('token'))) {
        container.classList.add('hidden');
        searchPage.classList.add('is-active');
        loadJSONData();
        loadCorpus();
    } else {
        container.classList.remove('hidden');
        searchPage.classList.remove('is-active');
    }

    window.PeekXAuth = PeekXAuth;
});

// 全局 handleLogout
window.handleLogout = function() {
    const storage = sessionStorage;
    const container = document.getElementById('auth-container');
    const searchPage = document.getElementById('search-page');
    const searchHistory = document.querySelector('.search-history');

    const supabaseClient = supabase?.createClient(
        'https://xupnsfldgnmeicumtqpp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro'
    );
    if (supabaseClient) {
        supabaseClient.auth.signOut().catch(err => console.error('Supabase 退出失败:', err));
    }

    localStorage.removeItem('token');
    localStorage.removeItem('salt');
    storage.removeItem("isLoggedIn");
    container.classList.remove('hidden');
    searchPage.classList.remove('is-active');
    searchHistory.classList.remove('visible');
    alert('您已成功退出登录，期待您的再次访问。');
};
