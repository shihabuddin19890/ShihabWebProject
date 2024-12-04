const fetch = require('node-fetch')
require('dotenv').config()

const getSubscription = async (req, res) => {
    const endPoint = process.env.DIGISTORE24_ENDPOINT
    const digistore24Token = process.env.DIGISTORE24_TOKEN
    const proSubscription = process.env.PRO_SUBSCRIPTION_ID

    try {
        const response = await fetch(`${endPoint}getProduct?product_id=${proSubscription}`, {
            method: 'GET',
            headers: {
                'X-DS-API-KEY': `${digistore24Token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        res.json(data.data)
    } catch (error) {
        console.log(error)
    }


}

const getValidateSubscription = async (req, res) => {
    const endPoint = process.env.DIGISTORE24_ENDPOINT
    const digistore24Token = process.env.DIGISTORE24_TOKEN
    const orderID = req.params.id
    console.log(orderID)
    try {
        const response = await fetch(`${endPoint}getPurchase?purchase_id=${orderID}`, {
            method: 'GET',
            headers: {
                'X-DS-API-KEY': `${digistore24Token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        res.json(data)
    } catch (error) {
        console.log(error)
    }

}

module.exports = { getSubscription, getValidateSubscription }

