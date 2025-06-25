# 🚀 Enhanced Jira Analytics Dashboard

A powerful, AI-enhanced dashboard for analyzing Jira project data with comprehensive analytics and intelligent insights.

## ✨ Features

- **📊 Comprehensive Analytics**: Issue tracking, resolution times, team performance
- **🤖 AI-Powered Analysis**: OpenAI integration with o3 model for intelligent insights
- **💬 Interactive Chat**: Ask questions about your project data
- **📝 Comment History**: Full visibility into ticket discussions
- **🔒 Secure Credentials**: HTTP-only cookie storage with auto-refresh
- **📱 Responsive Design**: Works on desktop and mobile
- **⚡ Real-time Data**: Live Jira API integration

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, Chart.js
- **AI**: OpenAI API (o3 model)
- **APIs**: Jira REST API v3

## 🚀 Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nonymaus/jira-dashboard.git
   cd jira-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   ```
   http://localhost:3000/custengg-dashboard-enhanced.html
   ```

### Railway Deployment

1. **Push to GitHub**
2. **Connect to Railway**: [railway.app](https://railway.app)
3. **Deploy**: Railway auto-detects and deploys

## 🔧 Configuration

### Required Credentials

- **Jira Base URL**: Your Jira instance URL
- **Jira Username**: Your email address
- **Jira API Token**: Generate from Jira settings
- **OpenAI API Key**: From OpenAI dashboard

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-random-secret
```

## 📖 Usage

1. **Enter Credentials**: Jira and OpenAI credentials
2. **Load Data**: Fetch issues from your Jira project
3. **Analyze**: View charts, metrics, and AI insights
4. **Chat**: Ask questions about your data
5. **Export**: Save analysis results

## 🔒 Security

- HTTP-only cookies for credential storage
- 1-hour credential expiration with auto-refresh
- CORS protection
- Input validation and sanitization

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**nonymaus**

---

🌟 **Star this repo if you find it useful!**
