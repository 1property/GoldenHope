require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

console.log("🔑 OpenRouter API Key Loaded:", !!process.env.OPENROUTER_API_KEY);

// Serve chat-box.html
app.get('/chat-box', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat-box.html'));
});

// Chat route
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log("📨 Incoming message:", userMessage);

  // Handle date question locally
  if (userMessage.toLowerCase().includes("what date is today") || userMessage.toLowerCase().includes("what is today date")) {
    const today = new Date().toLocaleDateString('en-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const reply = `Today is ${today}.`;
    console.log("📅 Local Date Reply:", reply);
    return res.json({ reply });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    console.log("🤖 OpenRouter Reply:", reply);
    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenRouter Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
