const generateMessage = (text, username) => {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

generateLocationUrl = (lat, long, username) => {
    return {
        locationUrl: `https://google.com/maps?q=${lat},${long}`,
        createdAt: new Date().getTime(),
        username
    }
}


module.exports = {
    generateMessage,
    generateLocationUrl
}