const axios = require('axios');
require('dotenv').config();

const generateContentByCommand = async (req, res) => {
    const { type, selectedText, currentContent } = req.body;
    const api_key = process.env.CHATGPT_API_KEY;

    let prompt;
    switch (type) {
        case 'intro':
            prompt = `Generate an 1000 word full blog in HTML format based on the following selected text: ${selectedText}`;
            break;
        case 'table_of_contents':
            prompt = `Generate a table of contents with heading and unorderlist in HTML not link based on the headings and subheadings in the following content: ${currentContent}.`;
            break;
        case 'paragraph':
            prompt = `Generate a detailed paragraph in HTML format that expands on the following selected text: ${selectedText}.`;
            break;
        case 'continue_paragraph':
            prompt = `Continue the following paragraph in HTML format: "${selectedText}". Use appropriate <p> tags. Context: "${currentContent}".`;
            break;
        case 'expand_paragraph':
            prompt = `Expand the following paragraph in HTML format: "${selectedText}". `;
            break;
        default:
            return res.status(400).json({ error: 'Unknown command type' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a content creator assistant.' },
                { role: 'user', content: prompt }
            ],

        }, {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        const generatedText = response.data.choices[0].message.content;
        res.json({ generatedText });
    } catch (error) {
        console.error('Error generating content by command:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
};

module.exports = { generateContentByCommand };
