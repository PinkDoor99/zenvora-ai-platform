// AI Coding Lessons System for Zenvora AI Platform
// Interactive lessons for beginner, intermediate, advanced, and expert levels

class AILessonsSystem {
    constructor() {
        this.currentLesson = null;
        this.userProgress = new Map();
        this.lessons = this.generateLessons();
    }

    generateLessons() {
        return {
            beginner: [
                {
                    id: 'beginner-1',
                    title: 'Your First Lines of Code',
                    category: 'basics',
                    difficulty: 'beginner',
                    estimatedTime: 30,
                    description: 'Learn the fundamental building blocks of programming',
                    objectives: ['Write your first function', 'Understand variables', 'Master basic syntax'],
                    content: this.generateLessonContent('beginner-1'),
                    interactive: true,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Hello World Function',
                            code: `function helloWorld() {
    console.log("Hello, World!");
}`,
                            explanation: 'Your first function that outputs text to the console'
                        },
                        {
                            language: 'python',
                            title: 'Hello World Function',
                            code: `def hello_world():
    print("Hello, World!")`,
                            explanation: 'Python version of the classic first program'
                        }
                    ]
                },
                {
                    id: 'beginner-2',
                    title: 'Variables and Data Types',
                    category: 'basics',
                    difficulty: 'beginner',
                    estimatedTime: 45,
                    description: 'Learn how to store and manipulate data in your programs',
                    objectives: ['Declare variables', 'Use different data types', 'Type conversion', 'String manipulation'],
                    content: this.generateLessonContent('beginner-2'),
                    interactive: true,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Variables and Constants',
                            code: `// Variables
let name = "Alice";
let age = 25;
const PI = 3.14159;
let isStudent = true;

// Constants
const MAX_USERS = 100;

console.log("Name:", name);
console.log("Age:", age);
console.log("Student:", isStudent);
console.log("PI:", PI);`,
                            explanation: 'Learn to declare variables, use constants, and understand data types'
                        }
                    ]
                },
                {
                    id: 'beginner-3',
                    title: 'Control Flow - If/Else Statements',
                    category: 'basics',
                    difficulty: 'beginner',
                    estimatedTime: 60,
                    description: 'Master the art of making decisions in your code using conditional statements',
                    objectives: ['Write if/else statements', 'Use comparison operators', 'Handle multiple conditions', 'Practice logical thinking'],
                    content: this.generateLessonContent('beginner-3'),
                    interactive: true,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Age Checker',
                            code: `function checkAge(age) {
    if (age < 18) {
        return "Minor";
    } else if (age < 65) {
        return "Adult";
    } else {
        return "Senior";
    }
}`,
                            explanation: 'Learn to make decisions in your code using if/else statements'
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'intermediate-1',
                    title: 'Arrays and Objects',
                    category: 'data-structures',
                    difficulty: 'intermediate',
                    estimatedTime: 90,
                    description: 'Master complex data structures and object-oriented programming concepts',
                    objectives: ['Create and manipulate arrays', 'Work with objects', 'Understand references', 'Use array methods'],
                    content: this.generateLessonContent('intermediate-1'),
                    interactive: true,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Array Operations',
                            code: `// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);
const filtered = numbers.filter(n => n > 2);

console.log("Original:", numbers);
console.log("Doubled:", doubled);
console.log("Sum:", sum);
console.log("Filtered:", filtered);`,
                            explanation: 'Learn to work with arrays using built-in methods'
                        },
                        {
                            language: 'javascript',
                            title: 'Object Methods',
                            code: `// Object methods
const person = {
    name: "Alice",
    age: 30,
    skills: ["JavaScript", "Python", "React"]
};

// Object destructuring
const { name, age, skills } = person;
console.log("Name:", name);
console.log("Age:", age);
console.log("Skills:", skills);`,
                            explanation: 'Learn to work with objects and extract properties using destructuring'
                        }
                    ]
                },
                {
                    id: 'intermediate-2',
                    title: 'Functions and Scope',
                    category: 'functions',
                    difficulty: 'intermediate',
                    estimatedTime: 120,
                    description: 'Deep dive into JavaScript functions, scope, and advanced programming patterns',
                    objectives: ['Understand function scope', 'Master closures', 'Use higher-order functions', 'Handle async/await patterns'],
                    content: this.generateLessonContent('intermediate-2'),
                    interactive: true,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Closures and Scope',
                            code: `// Closures example
function createCounter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3`,
                            explanation: 'Learn how closures work and how scope affects variable access'
                        },
                        {
                            language: 'javascript',
                            title: 'Async/Await Patterns',
                            code: `// Async/Await example
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}`,
                            explanation: 'Master asynchronous JavaScript programming with modern syntax'
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'advanced-1',
                    title: 'Design Patterns and Architecture',
                    category: 'architecture',
                    difficulty: 'advanced',
                    estimatedTime: 180,
                    description: 'Learn professional software design patterns and architectural principles',
                    objectives: ['Understand SOLID principles', 'Implement design patterns', 'Master error handling', 'Create scalable architecture'],
                    content: this.generateLessonContent('advanced-1'),
                    interactive: false,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Singleton Pattern',
                            code: `// Singleton pattern
class DatabaseConnection {
    constructor() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = this;
        }
    }
    
    static getInstance() {
        return DatabaseConnection.instance;
    }
    
    connect() {
        console.log("Connecting to database...");
    }
}

const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true`,
                            explanation: 'Learn to implement and recognize common design patterns'
                        },
                        {
                            language: 'javascript',
                            title: 'Observer Pattern',
                            code: `// Observer pattern
class EventEmitter {
    constructor() {
        this.listeners = [];
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
    }
    
    emit(event) {
        this.listeners.forEach(listener => listener(event));
    }
}`,
                            explanation: 'Learn the observer pattern for event-driven programming'
                        }
                    ]
                },
                {
                    id: 'advanced-2',
                    title: 'Performance Optimization',
                    category: 'performance',
                    difficulty: 'advanced',
                    estimatedTime: 150,
                    description: 'Master techniques for optimizing code performance, memory usage, and execution speed',
                    objectives: ['Understand performance metrics', 'Optimize algorithms', 'Memory management', 'Profiling techniques'],
                    content: this.generateLessonContent('advanced-2'),
                    interactive: false,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Memoization',
                            code: `// Memoization example
const memoize = (fn) => {
    const cache = new Map();
    
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

const fibonacci = memoize((n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});`,
                            explanation: 'Learn to cache expensive function calls for better performance'
                        }
                    ]
                }
            ],
            expert: [
                {
                    id: 'expert-1',
                    title: 'System Design and Architecture',
                    category: 'architecture',
                    difficulty: 'expert',
                    estimatedTime: 240,
                    description: 'Master the art of designing complex software systems and scalable architectures',
                    objectives: ['Design scalable systems', 'Understand microservices', 'Master system integration', 'Lead technical decisions'],
                    content: this.generateLessonContent('expert-1'),
                    interactive: false,
                    codeExamples: [
                        {
                            language: 'javascript',
                            title: 'Microservices Architecture',
                            code: `// Microservices example
class UserService {
    constructor(database) {
        this.db = database;
    }
    
    async getUser(id) {
        return await this.db.users.findById(id);
    }
    
    async createUser(userData) {
        const user = await this.db.users.create(userData);
        return user;
    }
}`,
                            explanation: 'Learn to design and build distributed systems'
                        }
                    ]
                }
            ]
        };
    }

    generateLessonContent(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return null;
        
        return {
            id: lesson.id,
            title: lesson.title,
            category: lesson.category,
            difficulty: lesson.difficulty,
            estimatedTime: lesson.estimatedTime,
            description: lesson.description,
            objectives: lesson.objectives,
            content: this.generateLessonHTML(lesson),
            interactive: lesson.interactive,
            codeExamples: lesson.codeExamples
        };
    }

    generateLessonHTML(lesson) {
        let html = `
            <div class="lesson-container">
                <div class="lesson-header">
                    <h2>${lesson.title}</h2>
                    <div class="lesson-meta">
                        <span class="difficulty ${lesson.difficulty}">${lesson.difficulty.toUpperCase()}</span>
                        <span class="category">${lesson.category}</span>
                        <span class="time">⏱ ${lesson.estimatedTime} min</span>
                    </div>
                </div>
                
                <div class="lesson-content">
                    <div class="lesson-description">
                        <h3>📚 What You'll Learn</h3>
                        <p>${lesson.description}</p>
                        
                        <h3>🎯 Objectives</h3>
                        <ul>
                            ${lesson.objectives.map(obj => `<li>${obj}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="lesson-examples">
                        <h3>💻 Code Examples</h3>
                        ${lesson.codeExamples.map(example => `
                            <div class="code-example">
                                <div class="example-header">
                                    <span class="language">${example.language.toUpperCase()}</span>
                                    <span class="example-title">${example.title}</span>
                                </div>
                                <pre><code>${example.code}</code></pre>
                                <p class="explanation">${example.explanation}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${lesson.interactive ? `
                    <div class="interactive-section">
                        <h3>🎮 Interactive Exercise</h3>
                        <div class="exercise-container">
                            <p>Try this exercise in the code editor:</p>
                            <div class="exercise-prompt">
                                <strong>Exercise:</strong> ${this.generateExercisePrompt(lesson)}
                            </div>
                            <textarea id="exercise-${lesson.id}" class="exercise-editor" placeholder="Write your solution here..."></textarea>
                            <button onclick="checkExercise('${lesson.id}')" class="exercise-button">Check Solution</button>
                            <button onclick="showHint('${lesson.id}')" class="exercise-button">Show Hint</button>
                        </div>
                        <div id="exercise-result-${lesson.id}" class="exercise-result"></div>
                    </div>
                </div>
                ` : ''}
                
                <div class="lesson-navigation">
                    <button onclick="previousLesson('${lesson.id}')" class="nav-button">⬅️ Previous</button>
                    <button onclick="nextLesson('${lesson.id}')" class="nav-button">Next Lesson ➡️</button>
                </div>
            </div>
            
            <div class="lesson-styles">
                <style>
                    .lesson-container {
                        background: var(--bg-primary);
                        border-radius: 12px;
                        padding: 24px;
                        margin: 16px 0;
                        box-shadow: var(--shadow-lg);
                    }
                    
                    .lesson-header {
                        border-bottom: 1px solid var(--border-color);
                        padding-bottom: 16px;
                        margin-bottom: 20px;
                    }
                    
                    .lesson-title {
                        color: var(--text-primary);
                        margin: 0;
                    }
                    
                    .lesson-meta {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                        margin-bottom: 12px;
                    }
                    
                    .difficulty {
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    
                    .difficulty.beginner { background: var(--accent-success); color: white; }
                    .difficulty.intermediate { background: var(--accent-warning); color: white; }
                    .difficulty.advanced { background: var(--accent-error); color: white; }
                    .difficulty.expert { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                    
                    .category {
                        padding: 4px 8px;
                        border-radius: 4px;
                        background: var(--bg-secondary);
                        color: var(--text-secondary);
                        font-size: 12px;
                    }
                    
                    .time {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        color: var(--text-muted);
                    }
                    
                    .lesson-content {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 24px;
                    }
                    
                    .lesson-description h3 {
                        color: var(--text-primary);
                        margin-bottom: 8px;
                    }
                    
                    .lesson-description p {
                        color: var(--text-secondary);
                        line-height: 1.6;
                    }
                    
                    .lesson-examples {
                        background: var(--bg-secondary);
                        border-radius: 8px;
                        padding: 16px;
                    }
                    
                    .example-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    
                    .language {
                        background: var(--accent-primary);
                        color: white;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: 600;
                    }
                    
                    .example-title {
                        color: var(--text-primary);
                        font-weight: 600;
                    }
                    
                    .code-example pre {
                        background: var(--bg-tertiary);
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        padding: 12px;
                        overflow-x: auto;
                        font-family: 'Consolas', 'Monaco', monospace;
                        font-size: 14px;
                        color: var(--text-primary);
                    }
                    
                    .explanation {
                        color: var(--text-secondary);
                        font-size: 14px;
                        margin-top: 8px;
                    }
                    
                    .interactive-section {
                        background: var(--bg-tertiary);
                        border-radius: 8px;
                        padding: 20px;
                        border: 1px solid var(--border-color);
                    }
                    
                    .exercise-container {
                        text-align: center;
                    }
                    
                    .exercise-prompt {
                        background: var(--bg-primary);
                        color: var(--text-primary);
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 12px;
                        font-weight: 500;
                    }
                    
                    .exercise-editor {
                        width: 100%;
                        height: 150px;
                        border: 1px solid var(--border-color);
                        border-radius: 6px;
                        padding: 12px;
                        font-family: 'Consolas', 'Monaco', monospace;
                        font-size: 14px;
                        color: var(--text-primary);
                        resize: vertical;
                    }
                    
                    .exercise-button {
                        background: var(--accent-primary);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        margin: 0 6px;
                    }
                    
                    .exercise-button:hover {
                        background: var(--accent-secondary);
                        transform: translateY(-2px);
                    }
                    
                    .exercise-result {
                        margin-top: 12px;
                        padding: 12px;
                        border-radius: 6px;
                        font-weight: 500;
                    }
                    
                    .exercise-result.success {
                        background: var(--accent-success);
                        color: white;
                        border: 1px solid var(--accent-success);
                    }
                    
                    .exercise-result.error {
                        background: var(--accent-error);
                        color: white;
                        border: 1px solid var(--accent-error);
                    }
                    
                    .nav-button {
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                        border: 1px solid var(--border-color);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        margin: 4px;
                    }
                    
                    .nav-button:hover {
                        background: var(--accent-primary);
                        color: white;
                        border-color: var(--accent-primary);
                    }
                </style>
            </div>
        `;
        
        return html;
    }

    generateExercisePrompt(lesson) {
        const prompts = {
            'beginner-1': 'Create a function that prints "Hello, World!" to the console',
            'beginner-2': 'Create variables for your name, age, and student status',
            'beginner-3': 'Write an if/else statement that checks if a person is a minor, adult, or senior based on age',
            'intermediate-1': 'Create an array of numbers and use array methods to double each number',
            'intermediate-2': 'Create a function that returns an object with properties, then use object destructuring to extract them',
            'advanced-1': 'Implement a singleton pattern for a database connection class',
            'expert-1': 'Design a microservices architecture for a user management system'
        };
        
        return prompts[lesson.id] || 'Complete this exercise to practice your skills!';
    }

    checkExercise(lessonId) {
        const editor = document.getElementById(`exercise-${lessonId}`);
        const resultDiv = document.getElementById(`exercise-result-${lessonId}`);
        
        if (!editor || !resultDiv) return;
        
        const userCode = editor.value.trim();
        const expectedSolutions = {
            'beginner-1': 'function helloWorld() { console.log("Hello, World!"); }',
            'beginner-2': 'name = "Alice"; age = 25; isStudent = true;',
            'beginner-3': 'if (age < 18) { return "Minor"; } else if (age < 65) { return "Adult"; } else { return "Senior"; }',
            'intermediate-1': 'const doubled = numbers.map(n => n * 2);',
            'intermediate-2': 'const { name, age, skills } = person;',
            'advanced-1': 'class DatabaseConnection { constructor() { if (!DatabaseConnection.instance) { DatabaseConnection.instance = this; } } }'
        };
        
        const isCorrect = this.validateExercise(userCode, expectedSolutions[lessonId]);
        
        resultDiv.className = isCorrect ? 'exercise-result success' : 'exercise-result error';
        resultDiv.innerHTML = isCorrect ? 
            '✅ <strong>Correct!</strong> Great job! You\'ve mastered this concept.' : 
            '❌ <strong>Not quite right</strong> Try again. Hint: ' + this.getHint(lessonId);
        
        // Track progress
        this.updateProgress(lessonId, isCorrect);
    }

    getHint(lessonId) {
        const hints = {
            'beginner-1': 'Remember: Functions need to be declared with the "function" keyword',
            'beginner-2': 'Use const or let instead of var for better variable scoping',
            'beginner-3': 'Make sure your if statement has a corresponding else for all conditions',
            'intermediate-1': 'Use the map() method to transform each element in an array',
            'intermediate-2': 'Use destructuring syntax: const { name, age } = person;',
            'advanced-1': 'Remember: Singletons should have a private constructor and a getInstance() method'
        };
        
        return hints[lessonId] || 'Keep trying! You\'re doing great!';
    }

    validateExercise(userCode, expectedSolution) {
        // Simple validation - in real app, this would be more sophisticated
        try {
            // Create a function from the user code
            const userFunction = new Function('return ' + userCode);
            const expectedResult = eval(expectedSolution);
            const actualResult = userFunction();
            
            // Compare results
            return JSON.stringify(actualResult) === JSON.stringify(expectedResult);
        } catch (error) {
            return false;
        }
    }

    updateProgress(lessonId, isCorrect) {
        const currentProgress = this.userProgress.get(lessonId) || { completed: false, attempts: 0 };
        
        if (isCorrect) {
            currentProgress.completed = true;
        } else {
            currentProgress.attempts++;
        }
        
        this.userProgress.set(lessonId, currentProgress);
        
        // Save to localStorage (in real app, save to backend)
        localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(currentProgress));
        
        // Show progress notification
        this.showNotification(
            isCorrect ? 'Lesson completed! 🎉' : 'Keep practicing! 💪',
            isCorrect ? 'success' : 'info'
        );
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'lesson-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--accent-success)' : 'var(--accent-primary)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    previousLesson(lessonId) {
        const lessons = this.getAllLessons();
        const currentIndex = lessons.findIndex(l => l.id === lessonId);
        
        if (currentIndex > 0) {
            const prevLesson = lessons[currentIndex - 1];
            this.loadLesson(prevLesson.id);
        }
    }

    nextLesson(lessonId) {
        const lessons = this.getAllLessons();
        const currentIndex = lessons.findIndex(l => l.id === lessonId);
        
        if (currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            this.loadLesson(nextLesson.id);
        }
    }

    getAllLessons() {
        const allLessons = [];
        Object.values(this.lessons).forEach(categoryLessons => {
            allLessons.push(...categoryLessons);
        });
        
        return allLessons.sort((a, b) => {
            const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
            if (difficultyOrder[a.difficulty] !== difficultyOrder[b.difficulty]) {
                return 1;
            }
            if (difficultyOrder[a.difficulty] === difficultyOrder[b.difficulty]) {
                return a.difficulty.localeCompare(b.difficulty);
            }
            return 0;
        });
    }

    loadLesson(lessonId) {
        this.currentLesson = this.generateLessonContent(lessonId);
        this.renderLesson();
    }

    renderLesson() {
        const lessonContainer = document.getElementById('lesson-container');
        if (!lessonContainer) return;
        
        lessonContainer.innerHTML = this.currentLesson.content;
        
        // Add event listeners for interactive exercises
        if (this.currentLesson.interactive) {
            setTimeout(() => {
                const exerciseButton = document.querySelector('.exercise-button');
                if (exerciseButton) {
                    exerciseButton.addEventListener('click', () => {
                        const lessonId = this.currentLesson.id;
                        this.checkExercise(lessonId);
                    });
                }
            }, 100);
        }
    }

    // Initialize when page loads
    init() {
        this.loadStoredProgress();
    }

    loadStoredProgress() {
        // Load progress from localStorage
        for (let i = 1; i <= 50; i++) {
            const progress = localStorage.getItem(`lesson_progress_${i}`);
            if (progress) {
                this.userProgress.set(`lesson-${i}`, JSON.parse(progress));
            }
        }
    }
}

// Export for use in frontend
window.AILessonsSystem = AILessonsSystem;
