const db = require('../models/db')

const createPrompt = async (req, res) => {
    const { promptName, promptText, promptUseFor } = req.body;

    try {
        const insertSql = `INSERT INTO prompts (prompt_name, prompt_text, use_for) VALUES (?, ?, ?)`;
        db.query(insertSql, [promptName, promptText, promptUseFor], (err, result) => {
            if (err) throw err;
            res.status(200).json({ message: "Succesfull" })
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

const fetchPrompt = async (req, res) => {
    try {
        const insertSql = `SELECT * FROM prompts`;
        db.query(insertSql, (err, result) => {
            if (err) throw err;
            res.json(result);
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const updatePrompt = async (req, res) => {
    const { id } = req.params;
    const { promptName, promptText, promptUseFor, promptInUse } = req.body;
    const insertSql = `UPDATE prompts SET prompt_name = ?, prompt_text = ?, use_for = ?, in_use = ?
    WHERE id = ?;`

    try {
        db.query(insertSql, [promptName, promptText, promptUseFor, promptInUse, id], (err, result) => {
            if (err) throw err;
            res.status(200).json({ message: "Update Succesfull" })
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const deletePrompt = async (req, res) => {
    const { id } = req.params;
    const insertSql = `DELETE FROM prompts WHERE id = ?;`;
    try {
        db.query(insertSql, [id], (err, result) => {
            if (err) throw err;
            res.status(200).json({ message: "Delete Succesfull" })
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const fetchPromptByCondition = async (req, res) => {
    const { product_use_for, product_in_use } = req.params;
    const insertSql = `SELECT * FROM prompts WHERE use_for = ? and in_use = ?`

    try {
        db.query(insertSql, [product_use_for, product_in_use], (err, result) => {
            if (err) throw err;
            res.json(result);
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createPrompt, fetchPrompt, updatePrompt, deletePrompt, fetchPromptByCondition };