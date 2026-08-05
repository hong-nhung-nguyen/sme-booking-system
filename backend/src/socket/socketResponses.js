const socketSuccess = (data = {}) => ({
    success: true,
    data
});

const socketError = (code, message) => ({
    success: false,
    error: {
        code,
        message
    }
});

module.exports = {
    socketSuccess,
    socketError
}