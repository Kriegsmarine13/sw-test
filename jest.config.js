/** jest.config.js */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testRegex: '.+\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 20000,
};
