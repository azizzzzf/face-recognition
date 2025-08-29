// Jest setup file
const { TextEncoder, TextDecoder } = require('util');

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for API testing
const fetch = require('node-fetch');
global.fetch = fetch;

// Increase timeout for API tests
jest.setTimeout(30000);