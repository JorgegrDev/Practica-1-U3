module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['./jest.setup.js'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    }
};