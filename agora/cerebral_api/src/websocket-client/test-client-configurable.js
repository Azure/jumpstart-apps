const { io } = require('socket.io-client');
const readline = require('readline');
const config = require('./config');

console.log('Config:', config);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentIndustry = '';
let currentRole = '';
const socket = io(config.SERVER_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

// Connection event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    setup();
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Response event handlers
socket.on('classification', (data) => {
    console.log('\nQuestion Classification:', data.category);
});

socket.on('context', (data) => {
    console.log('\nContext:', data.context);
});

socket.on('query', (data) => {
    console.log('\nGenerated Query:', data.query);
});

socket.on('token', (data) => {
    // Print tokens without newline for streaming effect
    process.stdout.write(data.token);
});

socket.on('result', (data) => {
    console.log('\nQuery Result:', JSON.stringify(data.result, null, 2));
});

socket.on('recommendations', (data) => {
    console.log('\nRecommendations:', JSON.stringify(data.recommendations, null, 2));
});

socket.on('error', (data) => {
    console.error('\nError:', data.error);
});

socket.on('complete', () => {
    console.log('\n\nProcessing complete');
    promptQuestion();
});

// Function to select industry
async function selectIndustry() {
    const industries = Object.keys(config.INDUSTRIES);
    console.log('\nAvailable industries:');
    industries.forEach((industry, index) => {
        console.log(`${index + 1}. ${industry}`);
    });

    return new Promise((resolve) => {
        rl.question('\nSelect industry number: ', (answer) => {
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < industries.length) {
                currentIndustry = industries[index];
                resolve(true);
            } else {
                console.log('Invalid selection. Please try again.');
                resolve(false);
            }
        });
    });
}

// Function to select role
async function selectRole() {
    const roles = config.INDUSTRIES[currentIndustry];
    console.log('\nAvailable roles for ' + currentIndustry + ':');
    roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role}`);
    });

    return new Promise((resolve) => {
        rl.question('\nSelect role number: ', (answer) => {
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < roles.length) {
                currentRole = roles[index];
                resolve(true);
            } else {
                console.log('Invalid selection. Please try again.');
                resolve(false);
            }
        });
    });
}

// Function to setup initial configuration
async function setup() {
    let validSelection = false;
    while (!validSelection) {
        validSelection = await selectIndustry();
    }
    
    validSelection = false;
    while (!validSelection) {
        validSelection = await selectRole();
    }

    console.log(`\nSelected configuration: Industry: ${currentIndustry}, Role: ${currentRole}`);
    promptQuestion();
}

// Modified promptQuestion to use current industry and role
function promptQuestion() {
    rl.question('\nEnter your question (or "config" to change industry/role, "exit" to quit): ', (question) => {
        if (question.toLowerCase() === 'exit') {
            console.log('Closing connection...');
            socket.close();
            rl.close();
            return;
        }

        if (question.toLowerCase() === 'config') {
            setup();
            return;
        }

        socket.emit('process_question', {
            question: question,
            industry: currentIndustry,
            role: currentRole
        });
    });
}

// Handle program termination
rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
});

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});