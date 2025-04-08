let CONFIG = null;
let supabaseClient = null;

const PASSWORD = window.ENCRYPTION_PASSWORD || 'mysecretpassword123';
const ENCRYPTION_KEY = CryptoJS.SHA256(PASSWORD).toString(CryptoJS.enc.Hex);

async function decryptSupabaseConfig() {
    try {
        console.log('Fetching supabase-config.json from /noise/assets/data/supabase-config.json');
        const response = await fetch('/noise/assets/data/supabase-config.json');
        if (!response.ok) throw new Error(`Failed to fetch supabase-config.json: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Raw supabase-config.json:', data);
        const { encrypted, iv } = data;
        if (!encrypted || !iv) throw new Error('Invalid supabase-config.json format');
        const encryptedWordArray = CryptoJS.enc.Hex.parse(encrypted);
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encryptedWordArray },
            CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
            { iv: CryptoJS.enc.Hex.parse(iv), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) throw new Error('Decryption failed: Empty result');
        const config = JSON.parse(decryptedText);
        console.log('Decrypted supabase-config:', config);
        return config;
    } catch (error) {
        console.error('解密 supabase-config.json 失败:', error);
        return null;
    }
}

async function loadConfig(supabaseConfig) {
    if (!supabaseConfig) {
        console.error('supabaseConfig is null');
        return null;
    }
    
    console.log('Creating Supabase client with:', supabaseConfig.SUPABASE_URL);
    if (!window.Supabase || !window.Supabase.createClient) {
        throw new Error('Supabase library not loaded correctly');
    }
    const supabase = window.Supabase.createClient(supabaseConfig.SUPABASE_URL, supabaseConfig.SUPABASE_KEY);
    try {
        console.log('Downloading config.json from Supabase config-bucket...');
        const { data, error } = await supabase.storage
            .from('config-bucket')
            .download('config.json');
        if (error) throw new Error(`Supabase download error: ${error.message}`);
        const configText = await data.text();
        const config = JSON.parse(configText);
        console.log('成功加载 CONFIG:', config);
        return { ...config, supabase };
    } catch (error) {
        console.error('加载 CONFIG 失败:', error);
        return null;
    }
}

async function loadDataFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`加载文件 ${filePath} 失败:`, error);
        return null;
    }
}

async function initializeConfig() {
    try {
        console.log('Starting CONFIG initialization...');
        const supabaseConfig = await decryptSupabaseConfig();
        const result = await loadConfig(supabaseConfig);
        if (!result) {
            console.error('CONFIG 初始化失败: loadConfig returned null');
            throw new Error('Failed to initialize CONFIG');
        }
        CONFIG = result;
        supabaseClient = result.supabase;
        console.log('CONFIG and supabaseClient initialized successfully:', CONFIG);
    } catch (error) {
        console.error('initializeConfig failed:', error);
        throw error;
    }
}

const ELEMENTS = {
    signUpButton: document.getElementById('signUp'),
    signInButton: document.getElementById('signIn'),
    container: document.getElementById('auth-container'),
    searchPage: document.getElementById('search-page'),
    searchInput: document.getElementById('search-input'),
    resultsList: document.getElementById('results-list'),
    historyList: document.getElementById('history-list'),
    searchBar: document.querySelector('.search-bar'),
    historyButton: document.querySelector('.history-btn'),
    searchHistory: document.querySelector('.search-history'),
    logoutButton: document.querySelector('.logout-btn'),
    signInForm: document.querySelector('.sign-in-container form'),
    signUpForm: document.querySelector('.sign-up-container form'),
    searchButton: document.querySelector('.search-btn'),
    randomButton: document.querySelector('.random-btn')
};

if (Object.values(ELEMENTS).some(el => !el)) {
    console.error('DOM elements missing:', ELEMENTS);
    throw new Error('Initialization failed due to missing DOM elements');
}

const state = {
    userData: null,
    workbookData: null,
    corpus: null,
    fuse: null,
    searchCache: new Map(),
    searchHistory: [],
    randomCount: 0,
    maxRandomCount: 5,
    isAnimating: false
};

const utils = {
    decodeBase64UTF8(base64Str) {
        try {
            const binaryStr = atob(base64Str);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            return new TextDecoder('utf-8').decode(bytes);
        } catch (error) {
            throw new Error(`Base64 decode failed: ${error.message}`);
        }
    },

    async hashPassword(password) {
        const data = new TextEncoder().encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    generateToken(username) {
        const salt = crypto.randomUUID();
        const payload = { username, exp: Date.now() + (CONFIG?.TOKEN_EXPIRY_MS || 3600000), salt };
        localStorage.setItem('salt', salt);
        return btoa(JSON.stringify(payload));
    },

    verifyToken(token) {
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            return false;
        }
        try {
            const payload = JSON.parse(atob(token));
            if (payload.exp < Date.now() || payload.salt !== localStorage.getItem('salt')) {
                localStorage.removeItem('token');
                localStorage.removeItem('salt');
                return false;
            }
            return true;
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            return false;
        }
    },

    sanitizeInput(input) {
        return input.replace(/[&<>"'`;=()/\\]/g, '');
    },

    isMembershipValid(expiryDate) {
        const current = new Date().setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate).getTime();
        return expiry > current && !isNaN(expiry);
    }
};

const dataLoader = {
    async loadJSONData() {
        try {
            const data = await loadDataFile(CONFIG.JSON_DATA_PATH);
            if (!data) throw new Error('Failed to load JSON data');
            state.workbookData = data; // 假设数据已是 JSON，无需 Base64 解码
            console.log('JSON data loaded');
        } catch (error) {
            console.error('Load JSON failed:', error);
            ELEMENTS.resultsList.innerHTML = '<li>Server busy, please try again later</li>';
        }
    },

    async loadCorpus() {
        try {
            const data = await loadDataFile(CONFIG.CORPUS_PATH);
            if (!data) throw new Error('Failed to load corpus');
            state.corpus = data;
            state.fuse = new Fuse(state.corpus, {
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
            console.log('Corpus loaded');
        } catch (error) {
            console.error('Load corpus failed:', error);
        }
    },

    async loadUserData(username) {
        if (!CONFIG) {
            console.error('CONFIG 未初始化，无法加载用户数据');
            return null;
        }
        try {
            console.log(`Loading user data from: ${CONFIG.USER_DATA_PATH}/${username}.json`);
            const data = await loadDataFile(`${CONFIG.USER_DATA_PATH}/${username}.json`);
            if (!data) return null;
            state.userData = data;
            return state.userData;
        } catch (error) {
            console.error('Load user data failed:', error);
            return null;
        }
    }
};

const search = {
    json(query) {
        if (!state.workbookData) {
            ELEMENTS.resultsList.innerHTML = '<li>Server busy, please try again later</li>';
            return null;
        }
        // 保持原有逻辑
        // ...
    },

    corpus(query) {
        if (!state.corpus || !state.fuse) return 'Corpus not loaded, please try again later';
        // 保持原有逻辑
        // ...
    },

    detectIntent(input) {
        // 保持原有逻辑
        // ...
    },

    generateResponse(intent, match) {
        // 保持原有逻辑
        // ...
    },

    typeLines(lines, element) {
        // 保持原有逻辑
        // ...
    },

    random() {
        console.log('Random called, count before:', state.randomCount);
        if (!state.workbookData) {
            this.typeLines(['Data not loaded, please try again later'], ELEMENTS.resultsList);
            return;
        }
        if (state.randomCount >= state.maxRandomCount) {
            this.typeLines([`随机策略已达上限 (${state.maxRandomCount}/${state.maxRandomCount})，无法继续使用`], ELEMENTS.resultsList);
            return;
        }
        const buyCandidates = state.workbookData.filter(row => row['策略'] === '买入');
        if (!buyCandidates.length) {
            this.typeLines(['没有符合“买入”策略的股票'], ELEMENTS.resultsList);
            return;
        }
        const item = buyCandidates[Math.floor(Math.random() * buyCandidates.length)];
        state.randomCount++;
        console.log('Count after:', state.randomCount);
        localStorage.setItem('randomCount', state.randomCount);
        const lines = [
            ...Object.entries(item).map(([k, v]) => `<span class="field">${k}:</span> <span class="value">${v}</span>`),
            `<span class="field">随机次数:</span> <span class="value">${state.randomCount}/${state.maxRandomCount}</span>`
        ];
        this.typeLines(lines, ELEMENTS.resultsList);
        state.searchHistory.unshift(`随机: ${item['股票代码']}`);
        this.updateHistory();
    },

    updateHistory() {
        ELEMENTS.historyList.innerHTML = state.searchHistory.slice(0, CONFIG.MAX_HISTORY)
            .map(item => `<li>${item}</li>`).join('');
        ELEMENTS.historyList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                if (!state.isAnimating) {
                    ELEMENTS.searchInput.value = li.textContent;
                    PeekXAuth.search();
                }
            });
        });
    }
};

const PeekXAuth = {
    async login(event) {
        event.preventDefault();
        console.log('Login attempt started');
        const email = utils.sanitizeInput(document.querySelector('.sign-in-container input[type="email"]').value.trim());
        const password = utils.sanitizeInput(document.querySelector('.sign-in-container input[type="password"]').value.trim());

        if (!CONFIG || !supabaseClient) {
            console.error('CONFIG 或 supabaseClient 未初始化，跳过 Supabase 登录');
        } else {
            try {
                console.log('Attempting Supabase login...');
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                const expiryDate = data.user.user_metadata?.expiry_date;
                if (!utils.isMembershipValid(expiryDate)) {
                    alert('Your membership has expired. Redirecting to payment...');
                    localStorage.setItem('expiredEmail', email);
                    setTimeout(() => window.location.href = '/peekx/payment/index.html', 2000);
                    return;
                }
                localStorage.setItem('token', data.session.access_token);
                this.postLogin();
                alert('Login successful (Supabase)');
                return;
            } catch (error) {
                console.warn('Supabase login failed:', error.message);
            }
        }

        const user = await dataLoader.loadUserData(email);
        if (!user) {
            alert('User not found or network error');
            return;
        }
        if (user.password !== await utils.hashPassword(password)) {
            alert('Incorrect email or password');
            return;
        }
        if (!utils.isMembershipValid(user.expiry_date)) {
            alert('Your membership has expired. Redirecting to payment...');
            localStorage.setItem('expiredEmail', email);
            setTimeout(() => window.location.href = '/peekx/payment/index.html', 2000);
            return;
        }
        localStorage.setItem('token', utils.generateToken(email));
        this.postLogin();
        alert('Login successful (JSON)');
    },

    async register(event) {
        event.preventDefault();
        if (!supabaseClient) {
            alert('Supabase not loaded, registration unavailable');
            return;
        }
        const name = utils.sanitizeInput(document.querySelector('.sign-up-container input[type="text"]').value.trim());
        const email = utils.sanitizeInput(document.querySelector('.sign-up-container input[type="email"]').value.trim());
        const password = utils.sanitizeInput(document.querySelector('.sign-up-container input[type="password"]').value.trim());

        if (!name || !email || !password) {
            alert('Please fill all required fields');
            return;
        }

        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { expiry_date: expiryDate, full_name: name } }
            });
            if (error) throw error;
            alert(data.user ? `Registered successfully! User ID: ${data.user.id}, expires: ${expiryDate}` : `Registration successful, please verify your email! Expires: ${expiryDate}`);
            ELEMENTS.container.classList.remove('right-panel-active');
        } catch (error) {
            alert(`Registration failed: ${error.message}`);
        }
    },

    async search() {
        if (!utils.verifyToken(localStorage.getItem('token'))) {
            ELEMENTS.container.classList.remove('hidden');
            ELEMENTS.searchPage.classList.remove('is-active');
            alert('Please log in first');
            return;
        }

        const query = ELEMENTS.searchInput.value.trim();
        if (!query) return;

        const isJSONQuery = query.includes(':') || /^[\u4e00-\u9fa5A-Za-z]+\d+$|^\d+[\u4e00-\u9fa5A-Za-z]+$|^\d+$/.test(query) || (/[，, ]/.test(query) && query.split(/[，, ]+/).length === 2);
        const result = isJSONQuery ? search.json(query) : search.corpus(query);

        if (!result) {
            search.typeLines(['No results found'], ELEMENTS.resultsList);
            return;
        }
        search.typeLines(typeof result === 'string' ? result.split('\n').filter(Boolean) : result, ELEMENTS.resultsList);

        if (!state.searchHistory.includes(query)) {
            state.searchHistory.unshift(query);
            search.updateHistory();
        }
        adjustResultsWidth();
    },

    logout() {
        if (supabaseClient) supabaseClient.auth.signOut().catch(err => console.error('Supabase logout failed:', err));
        localStorage.clear();
        sessionStorage.clear();
        ELEMENTS.container.classList.remove('hidden');
        ELEMENTS.searchPage.classList.remove('is-active');
        ELEMENTS.searchHistory.classList.remove('visible');
        alert('Logged out successfully');
    },

    postLogin() {
        sessionStorage.setItem('isLoggedIn', 'true');
        ELEMENTS.container.classList.add('hidden');
        ELEMENTS.searchPage.classList.add('is-active');
        dataLoader.loadJSONData();
        dataLoader.loadCorpus();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ELEMENTS.signUpButton.addEventListener('click', () => ELEMENTS.container.classList.add('right-panel-active'));
    ELEMENTS.signInButton.addEventListener('click', () => ELEMENTS.container.classList.remove('right-panel-active'));
    ELEMENTS.historyButton.addEventListener('click', () => ELEMENTS.searchHistory.classList.toggle('visible'));
    ELEMENTS.logoutButton.addEventListener('click', PeekXAuth.logout.bind(PeekXAuth));
    ELEMENTS.signInForm.addEventListener('submit', PeekXAuth.login.bind(PeekXAuth));
    ELEMENTS.signUpForm.addEventListener('submit', PeekXAuth.register.bind(PeekXAuth));
    ELEMENTS.searchButton.addEventListener('click', PeekXAuth.search.bind(PeekXAuth));
    ELEMENTS.searchInput.addEventListener('keydown', e => e.key === 'Enter' && PeekXAuth.search());
    console.log('Binding random button');
    ELEMENTS.randomButton.addEventListener('click', () => {
        console.log('Random button clicked');
        search.random();
    });

    if (sessionStorage.getItem('isLoggedIn') === 'true' && utils.verifyToken(localStorage.getItem('token'))) {
        PeekXAuth.postLogin();
    } else {
        ELEMENTS.container.classList.remove('hidden');
        ELEMENTS.searchPage.classList.remove('is-active');
    }

    adjustResultsWidth();
    window.addEventListener('resize', adjustResultsWidth);
});

function adjustResultsWidth() {
    if (ELEMENTS.searchBar && ELEMENTS.resultsList) {
        ELEMENTS.resultsList.style.width = `${ELEMENTS.searchBar.offsetWidth}px`;
    }
}

window.addEventListener('load', async () => {
    try {
        await initializeConfig();
        console.log('CONFIG initialized:', CONFIG);
        console.log('supabaseClient initialized:', supabaseClient);
    } catch (error) {
        console.error('程序启动失败:', error);
    }
});

window.PeekXAuth = PeekXAuth;
window.handleLogout = PeekXAuth.logout;
