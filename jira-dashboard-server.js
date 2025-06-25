const express = require('express');
const axios = require('axios');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Serve static files
app.use(express.static(path.dirname(__filename)));

// Root route - redirect to dashboard
app.get('/', (req, res) => {
    res.redirect('/custengg-dashboard-enhanced.html');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Proxy endpoint for Jira API
app.post('/api/jira-proxy', async (req, res) => {
    let { baseUrl, username, apiToken, endpoint, params } = req.body;

    // Use stored credentials if not provided in request
    if (!baseUrl || !username || !apiToken) {
        const { jira_base_url, jira_username, jira_api_token } = req.cookies;
        baseUrl = baseUrl || jira_base_url;
        username = username || jira_username;
        apiToken = apiToken || jira_api_token;
    }
    
    console.log('Proxy request received:', {
        baseUrl,
        username,
        endpoint,
        params
    });
    
    try {
        // Handle both regular API and Service Desk API endpoints
        let url;
        if (endpoint.startsWith('/rest/servicedeskapi/')) {
            // Service Desk API endpoint
            url = `https://${baseUrl}${endpoint}`;
        } else if (endpoint.startsWith('/rest/api/')) {
            // Regular Jira API endpoint
            url = `https://${baseUrl}${endpoint}`;
        } else {
            // Default to regular API if no prefix specified
            url = `https://${baseUrl}/rest/api/3${endpoint}`;
        }
        
        console.log('Constructed URL:', url);
        
        const response = await axios.get(url, {
            params,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.response?.data || error.message);
        console.error('Full error:', error);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Proxy endpoint for OpenAI API
app.post('/api/openai-proxy', async (req, res) => {
    let { apiKey, model, messages } = req.body;

    // Use stored API key if not provided in request
    if (!apiKey) {
        const { openai_api_key } = req.cookies;
        apiKey = openai_api_key;
    }

    console.log('OpenAI proxy request received:', {
        model,
        messageCount: messages?.length,
        isReasoningModel: model && (model.startsWith('o3') || model.startsWith('o1') || model.startsWith('o4'))
    });

    try {
        // Prepare request body with model-specific parameters
        const requestBody = {
            model,
            messages
        };

        // Check if this is a reasoning model (o3, o1 series)
        const isReasoningModel = model && (
            model.startsWith('o3') ||
            model.startsWith('o1') ||
            model.startsWith('o4')
        );

        if (isReasoningModel) {
            // Reasoning models (o3, o1, o4) have specific requirements:
            // - Use max_completion_tokens instead of max_tokens
            // - Don't support temperature, top_p, or other sampling parameters
            requestBody.max_completion_tokens = 2000;
        } else {
            // Standard models (GPT-4, GPT-3.5, etc.) use regular parameters
            requestBody.max_tokens = 2000;
            requestBody.temperature = 0.7;
        }

        console.log('Sending request to OpenAI with parameters:', Object.keys(requestBody));

        const response = await axios.post('https://api.openai.com/v1/chat/completions', requestBody, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('OpenAI response received successfully');
        res.json({
            content: response.data.choices[0].message.content
        });
    } catch (error) {
        console.error('OpenAI proxy error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Cookie management endpoints
app.post('/api/store-credentials', (req, res) => {
    const { baseUrl, username, apiToken, openaiApiKey, openaiModel, rememberMe } = req.body;

    const maxAge = rememberMe ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 24 hours or 1 hour
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge
    };

    if (baseUrl) res.cookie('jira_base_url', baseUrl, cookieOptions);
    if (username) res.cookie('jira_username', username, cookieOptions);
    if (apiToken) res.cookie('jira_api_token', apiToken, cookieOptions);

    if (openaiApiKey) {
        res.cookie('openai_api_key', openaiApiKey, cookieOptions);
    }

    if (openaiModel) {
        res.cookie('openai_model', openaiModel, cookieOptions);
    }

    res.json({ success: true, message: 'Credentials stored securely' });
});

app.get('/api/test', (req, res) => {
    console.log('TEST endpoint called');
    res.json({ message: 'Server is working' });
});

app.get('/api/get-credentials', (req, res) => {
    console.log('GET /api/get-credentials called');
    console.log('Cookies:', req.cookies);
    const { jira_base_url, jira_username, jira_api_token, openai_api_key, openai_model } = req.cookies;
    console.log('Extracted values:', { jira_base_url, jira_username, jira_api_token, openai_api_key, openai_model });

    if (jira_base_url && jira_username && jira_api_token) {
        console.log('Has credentials, returning data');
        // Refresh cookie expiration
        const maxAge = 60 * 60 * 1000; // 1 hour
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge
        };

        res.cookie('jira_base_url', jira_base_url, cookieOptions);
        res.cookie('jira_username', jira_username, cookieOptions);
        res.cookie('jira_api_token', jira_api_token, cookieOptions);

        if (openai_api_key) {
            res.cookie('openai_api_key', openai_api_key, cookieOptions);
        }

        if (openai_model) {
            res.cookie('openai_model', openai_model, cookieOptions);
        }

        res.json({
            baseUrl: jira_base_url,
            username: jira_username,
            hasApiToken: true,
            hasOpenAIKey: !!openai_api_key,
            openaiModel: openai_model
        });
    } else {
        console.log('No credentials found, returning hasCredentials: false');
        res.json({ hasCredentials: false });
    }
});

app.post('/api/clear-credentials', (req, res) => {
    res.clearCookie('jira_base_url');
    res.clearCookie('jira_username');
    res.clearCookie('jira_api_token');
    res.clearCookie('openai_api_key');
    res.clearCookie('openai_model');

    res.json({ success: true, message: 'Credentials cleared' });
});

// Test Jira credentials endpoint
app.post('/api/test-credentials', async (req, res) => {
    console.log('POST /api/test-credentials called');
    const { baseUrl, username, apiToken } = req.body;

    if (!baseUrl || !username || !apiToken) {
        return res.status(400).json({ error: 'Missing required credentials' });
    }

    try {
        // Test credentials by making a simple API call to Jira
        const jiraUrl = `https://${baseUrl}/rest/api/3/myself`;
        const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');

        const response = await fetch(jiraUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('Jira credentials valid for user:', userData.displayName);
            res.json({ valid: true, user: userData.displayName });
        } else {
            console.log('Jira credentials invalid, status:', response.status);
            res.status(401).json({ valid: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error testing Jira credentials:', error);
        res.status(500).json({ valid: false, error: 'Failed to test credentials' });
    }
});

// Test OpenAI credentials endpoint
app.post('/api/test-openai-credentials', async (req, res) => {
    console.log('POST /api/test-openai-credentials called');
    const { apiKey, model } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'Missing API key' });
    }

    try {
        // Test OpenAI API key by making a simple API call
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('OpenAI credentials valid, available models:', data.data.length);
            res.json({ valid: true, modelCount: data.data.length });
        } else {
            console.log('OpenAI credentials invalid, status:', response.status);
            res.status(401).json({ valid: false, error: 'Invalid API key' });
        }
    } catch (error) {
        console.error('Error testing OpenAI credentials:', error);
        res.status(500).json({ valid: false, error: 'Failed to test API key' });
    }
});

// Store AI credentials endpoint
app.post('/api/store-ai-credentials', (req, res) => {
    console.log('POST /api/store-ai-credentials called');
    const { apiKey, model } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'Missing API key' });
    }

    const maxAge = 60 * 60 * 1000; // 1 hour
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge
    };

    res.cookie('openai_api_key', apiKey, cookieOptions);
    if (model) {
        res.cookie('openai_model', model, cookieOptions);
    }

    console.log('AI credentials stored successfully');
    res.json({ success: true, message: 'AI credentials stored' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/custengg-dashboard-enhanced.html`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
});
