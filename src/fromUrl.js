import crypto from 'crypto'
import aes from 'crypto-js/aes'
import fetch from 'node-fetch'

import { matchAll } from './matchAll'

export const BACKEND_V2_GET = "https://json.excalidraw.com/api/v2/";

export const regexExcalidrawUrl = /https:\/\/excalidraw\.com\/#json=(.{1,})\,(.{1,})/g

export const isExcalidrawUrl = url => regexExcalidrawUrl.test(String(url))

export const getParamsFromExcalidrawUrl = url => {
    if (!isExcalidrawUrl(url)) throw new Error('This is not a valid Excalidraw URL/')
    return matchAll(url)
}

export const getApiDataFromInputUrl = async url => {
    const [id, key] = matchAll(url)
    try {
        const bytes = await fetch(`${BACKEND_V2_GET}${id}`)
            .then(response => response)
        if (bytes) {
            const buffer = await response.arrayBuffer();
            const decrypt = (text, key) => {
                var decipher = crypto.createDecipher('aes-256-gcm',key, new Uint8Array(12))
                var dec = decipher.update(text)
                dec += decipher.final('utf8');
                return dec;
            }
            const data = decrypt(buffer, key);
            console.log(data);
            return data
        }
    } catch (error) {
        throw error
    }
}

export { regexExcalidrawUrl }