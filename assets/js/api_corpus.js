const { OpenAI } = require("openai");
require("dotenv").config();

// 初始化 OpenAI 客户端（xAI API）
const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
});

// 假设 state 和 CONFIG 已定义
// state.searchCache 是 Map 对象，CONFIG.CACHE_LIMIT 是缓存大小限制
const state = {
    searchCache: new Map(),
};
const CONFIG = {
    CACHE_LIMIT: 1000, // 示例值，实际根据需求设置
};

async function corpus(query) {
    // 输入预处理
    if (!query || typeof query !== "string") {
        return "Invalid query, please provide a valid string.";
    }
    query = query.trim().toLowerCase();
    if (!query) {
        return "Query is empty, please provide a valid input.";
    }

    // 检查缓存
    if (state.searchCache.has(query)) {
        return state.searchCache.get(query);
    }

    try {
        // 调用 xAI API
        const response = await client.chat.completions.create({
            model: "grok-beta",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful search assistant. Provide concise and accurate answers based on the user's query."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_tokens: 200, // 限制输出长度
            temperature: 0.7, // 控制回答的创造性
        });

        // 提取回答
        const answer = response.choices[0].message.content.trim();

        // 缓存结果
        if (state.searchCache.size >= CONFIG.CACHE_LIMIT) {
            state.searchCache.clear(); // 清空缓存
        }
        state.searchCache.set(query, answer);

        return answer;
    } catch (error) {
        console.error("API Error:", error.message);
        if (error.status === 429) {
            return "Rate limit exceeded, please try again later.";
        } else if (error.status === 401) {
            return "Authentication failed, please check your API key.";
        } else {
            return "An error occurred while processing your query, please try again.";
        }
    }
}

// 示例：测试 corpus 方法
async function testCorpus() {
    const query = "Explain quantum computing in one sentence.";
    const result = await corpus(query);
    console.log("Query:", query);
    console.log("Result:", result);

    // 测试缓存
    const cachedResult = await corpus(query);
    console.log("Cached Result:", cachedResult);
}

testCorpus();

module.exports = { corpus };
