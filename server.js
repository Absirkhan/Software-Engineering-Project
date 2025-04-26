const express = require('express');
const next = require('next');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
// Add PostgreSQL dependencies
const { Pool } = require('pg');
const pgPromise = require('pg-promise')();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const groq = new Groq({ apiKey: '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' });

// PostgreSQL configuration
const pgConfig = {
    host: 'localhost',
    port: 5432,
    database: 'job_portal',
    user: 'postgres',
    password: '6261626a' // Replace with your actual password
};

// Create a connection pool
const pool = new Pool(pgConfig);
// Alternative connection for transactions and more complex operations
const db = pgPromise(pgConfig);

// In-memory data (will be populated from database on server start)
let users = [];
let jobs = [];
let applications = [];
let notifications = [];
let interviews = [];
let savedJobs = [];
let ratings = [];
let chatMessages = [];

// Class definitions remain the same, they'll be used for creating objects before persisting to DB
class User {
    constructor(email, username, password, role = 'freelancer') {
        this.id = uuidv4();
        this.email = email;
        this.username = username;
        this.password = password;
        this.role = role; // 'client' or 'freelancer'
        this.projects = [];
        this.githubRepositories = []; // Add field to store GitHub repositories
        this.profile = {
            fullName: '',
            bio: '',
            skills: [],
            experience: [],
            education: [],
            portfolio: [],
            profilePicture: '',
            contactInfo: {
                phone: '',
                location: '',
                website: ''
            }
        };
    }
}

class Job {
    constructor(title, description, type, location, qualifications, experience, skills, salaryRange, benefits, timerDuration, autoRenew, client) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.type = type;
        this.location = location;
        this.qualifications = qualifications;
        this.experience = experience;
        this.skills = skills;
        this.salaryRange = salaryRange;
        this.benefits = benefits;
        this.timerDuration = timerDuration; // Timer in seconds
        this.autoRenew = autoRenew;
        this.client = client;
        this.createdAt = new Date().toISOString();
        this.expiryTime = new Date(Date.now() + timerDuration * 1000).toISOString(); // Calculate expiry time
        this.applications = [];
        this.status = 'active'; // active, closed, filled
        this.applyClicks = 0; // New property to track apply button clicks
    }
}

class JobApplication {
    constructor(jobId, freelancer, coverLetter, fileDetails) {
        this.id = uuidv4();
        this.jobId = jobId;
        this.freelancer = freelancer;
        this.coverLetter = coverLetter;
        this.genericResumePath = fileDetails.genericResumePath;
        this.jobSpecificResumePath = fileDetails.jobSpecificResumePath;
        this.coverLetterFilePath = fileDetails.coverLetterFilePath;
        this.status = 'pending'; // pending, accepted, rejected
        this.submittedAt = new Date().toISOString();
    }
}

class Notification {
    constructor(userId, message, type) {
        this.id = uuidv4();
        this.userId = userId;
        this.message = message;
        this.type = type; // job-application, status-update, message
        this.isRead = false;
        this.createdAt = new Date().toISOString();
    }
}

class Interview {
    constructor(applicationId, job, freelancer, client, dateTime, message) {
        this.id = uuidv4();
        this.applicationId = applicationId;
        this.jobId = job.id;
        this.jobTitle = job.title;
        this.freelancerId = freelancer.id;
        this.freelancerName = freelancer.username;
        this.clientId = client.id;
        this.clientName = client.username;
        this.dateTime = dateTime;
        this.message = message;
        this.status = 'scheduled'; // scheduled, completed, cancelled
        this.createdAt = new Date().toISOString();
    }
}

// Add new data models for saved jobs and ratings
class SavedJob {
    constructor(userId, jobId, savedAt) {
        this.id = uuidv4();
        this.userId = userId;
        this.jobId = jobId;
        this.savedAt = savedAt || new Date().toISOString();
    }
}

class Rating {
    constructor(freelancerId, clientId, jobId, applicationId, stars, comment, createdAt) {
        this.id = uuidv4();
        this.freelancerId = freelancerId;
        this.clientId = clientId;
        this.jobId = jobId;
        this.applicationId = applicationId;
        this.stars = stars; // 1-5
        this.comment = comment;
        this.createdAt = createdAt || new Date().toISOString();
    }
}

// Add new ChatMessage class
class ChatMessage {
    constructor(senderId, receiverId, content, readStatus = false) {
        this.id = uuidv4();
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.read = readStatus;
        this.createdAt = new Date().toISOString();
    }
}

// Helper function to load all data from the database
async function loadDataFromDatabase() {
    try {
        console.log('Loading data from database...');
        
        // Load users
        const usersResult = await pool.query('SELECT * FROM users');
        users = usersResult.rows.map(row => {
            const user = {
                id: row.id,
                email: row.email,
                username: row.username,
                password: row.password,
                role: row.role,
                githubId: row.github_id,
                githubToken: row.github_token,
                projects: row.projects || [],
                githubRepositories: row.github_repositories || [],
                profile: row.profile || {
                    fullName: '',
                    bio: '',
                    skills: [],
                    experience: [],
                    education: [],
                    portfolio: [],
                    profilePicture: '',
                    contactInfo: {
                        phone: '',
                        location: '',
                        website: ''
                    }
                },
                alertPreferences: row.alert_preferences || { enabled: true, skills: [] }
            };
            return user;
        });
        
        // Load jobs
        const jobsResult = await pool.query('SELECT * FROM jobs');
        jobs = jobsResult.rows.map(row => {
            return {
                id: row.id,
                title: row.title,
                description: row.description,
                type: row.type,
                location: row.location,
                qualifications: row.qualifications,
                experience: row.experience,
                skills: row.skills || [],
                salaryRange: row.salary_range,
                benefits: row.benefits,
                timerDuration: row.timer_duration,
                autoRenew: row.auto_renew,
                client: row.client,
                createdAt: row.created_at,
                expiryTime: row.expiry_time,
                applications: row.applications || [],
                status: row.status,
                applyClicks: row.apply_clicks
            };
        });
        
        // Load applications
        const applicationsResult = await pool.query('SELECT * FROM applications');
        applications = applicationsResult.rows.map(row => {
            return {
                id: row.id,
                jobId: row.job_id,
                freelancer: row.freelancer,
                coverLetter: row.cover_letter,
                genericResumePath: row.generic_resume_path,
                jobSpecificResumePath: row.job_specific_resume_path,
                coverLetterFilePath: row.cover_letter_file_path,
                status: row.status,
                submittedAt: row.submitted_at,
                interviewDateTime: row.interview_date_time,
                interviewMessage: row.interview_message
            };
        });
        
        // Load notifications
        const notificationsResult = await pool.query('SELECT * FROM notifications');
        notifications = notificationsResult.rows.map(row => {
            return {
                id: row.id,
                userId: row.user_id,
                message: row.message,
                type: row.type,
                isRead: row.is_read,
                createdAt: row.created_at
            };
        });
        
        // Load interviews
        const interviewsResult = await pool.query('SELECT * FROM interviews');
        interviews = interviewsResult.rows.map(row => {
            return {
                id: row.id,
                applicationId: row.application_id,
                jobId: row.job_id,
                jobTitle: row.job_title,
                freelancerId: row.freelancer_id,
                freelancerName: row.freelancer_name,
                clientId: row.client_id,
                clientName: row.client_name,
                dateTime: row.date_time,
                message: row.message,
                status: row.status,
                createdAt: row.created_at
            };
        });
        
        // Load saved jobs
        const savedJobsResult = await pool.query('SELECT * FROM saved_jobs');
        savedJobs = savedJobsResult.rows.map(row => {
            return {
                id: row.id,
                userId: row.user_id,
                jobId: row.job_id,
                savedAt: row.saved_at
            };
        });
        
        // Load ratings
        const ratingsResult = await pool.query('SELECT * FROM ratings');
        ratings = ratingsResult.rows.map(row => {
            return {
                id: row.id,
                freelancerId: row.freelancer_id,
                clientId: row.client_id,
                jobId: row.job_id,
                applicationId: row.application_id,
                stars: row.stars,
                comment: row.comment,
                createdAt: row.created_at
            };
        });
        
        // Load chat messages
        const chatMessagesResult = await pool.query('SELECT * FROM chat_messages');
        chatMessages = chatMessagesResult.rows.map(row => {
            return {
                id: row.id,
                senderId: row.sender_id,
                receiverId: row.receiver_id,
                content: row.content,
                read: row.read,
                createdAt: row.created_at
            };
        });
        
        console.log('Data loaded successfully!');
        console.log(`Loaded: ${users.length} users, ${jobs.length} jobs, ${applications.length} applications`);
    } catch (error) {
        console.error('Error loading data from database:', error);
        throw error;
    }
}

// Init database tables if they don't exist
async function initDatabase() {
    try {
        // We'll use the schema.sql file to initialize the database
        /*
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        await pool.query(schemaSql);
        console.log('Database schema initialized successfully');
        */
        
        await loadDataFromDatabase();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Configure GitHub OAuth strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: 'Ov23liu6WE4ObN5pnYJE',
            clientSecret: '5f69b0f0c2c7d5a2b55e2ecf9382c2570b84ce5c',
            callbackURL: 'http://localhost:3000/auth/github/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists in our in-memory array (already loaded from DB)
                let user = users.find(user => user.username === profile.username);
                
                if (!user) {
                    // Create a new user
                    user = new User(
                        profile.emails?.[0]?.value || `${profile.username}@github.com`,
                        profile.username,
                        '', // No password for OAuth users
                        'freelancer' // Default role
                    );
                    
                    // Add GitHub profile data
                    user.profile.fullName = profile.displayName || '';
                    user.profile.profilePicture = profile.photos?.[0]?.value || '';
                    user.githubId = profile.id;
                    user.githubToken = accessToken;
                    
                    // Insert into database
                    await pool.query(
                        'INSERT INTO users(id, email, username, password, role, github_id, github_token, profile) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
                        [user.id, user.email, user.username, user.password, user.role, user.githubId, user.githubToken, JSON.stringify(user.profile)]
                    );
                    
                    // Add to in-memory array
                    users.push(user);
                } else {
                    // Update existing user with GitHub data
                    user.githubId = profile.id;
                    user.githubToken = accessToken;
                    
                    // Update in database
                    await pool.query(
                        'UPDATE users SET github_id = $1, github_token = $2 WHERE id = $3',
                        [profile.id, accessToken, user.id]
                    );
                }

                // Fetch GitHub repositories
                try {
                    const reposResponse = await axios.get('https://api.github.com/user/repos', {
                        headers: {
                            'Authorization': `token ${accessToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        params: {
                            sort: 'updated',
                            per_page: 100
                        }
                    });
                    
                    if (reposResponse.status === 200) {
                        // Store simplified repository data
                        const repositories = reposResponse.data.map(repo => ({
                            id: repo.id,
                            name: repo.name,
                            fullName: repo.full_name,
                            description: repo.description,
                            url: repo.html_url,
                            language: repo.language,
                            stars: repo.stargazers_count,
                            forks: repo.forks_count,
                            isPrivate: repo.private,
                            updatedAt: repo.updated_at
                        }));
                        
                        user.githubRepositories = repositories;
                        
                        // Update repositories in the database
                        await pool.query(
                            'UPDATE users SET github_repositories = $1 WHERE id = $2',
                            [JSON.stringify(repositories), user.id]
                        );
                    }
                } catch (repoError) {
                    console.error('Error fetching GitHub repositories:', repoError.message);
                    // Continue without repositories if fetch fails
                }
                
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Fix serialization/deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(user => user.id === id);
    done(null, user || false);
});

// Initialize database and start app
initDatabase()
    .then(() => {
        return app.prepare();
    })
    .then(() => {
        const server = express();
        const httpServer = http.createServer(server);
        const io = socketIO(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        server.use(
            session({
                name: 'job_portal_session',
                secret: 'secretKey',
                resave: false,
                saveUninitialized: false,
                cookie: { 
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: 'lax',
                },
            })
        );

        server.use(bodyParser.urlencoded({ extended: true }));
        server.use(passport.initialize());
        server.use(passport.session());
        server.use(express.json());

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Configure storage
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                const userId = req.user.id;
                const userDir = path.join(uploadDir, userId);
                
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true });
                }
                
                cb(null, userDir);
            },
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path.extname(file.originalname);
                cb(null, file.fieldname + '-' + uniqueSuffix + ext);
            }
        });

        const upload = multer({ 
            storage: storage,
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype !== 'application/pdf') {
                    return cb(new Error('Only PDF files are allowed'));
                }
                cb(null, true);
            }
        });

        // Authentication middleware
        const isAuthenticated = (req, res, next) => {
            if (req.isAuthenticated()) {
                return next();
            }
            res.status(401).json({ error: 'Unauthorized' });
        };

        // GitHub Authentication Routes
        server.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

        server.get('/auth/github/callback', 
            passport.authenticate('github', { failureRedirect: '/login' }),
            (req, res) => {
                // Redirect based on user role
                if (req.user.role === 'freelancer') {
                    res.redirect('/freelancer_dashboard');
                } else {
                    res.redirect('/client_dashboard');
                }
            }
        );
        
        // Add an endpoint to get GitHub repositories for the profile
        server.get('/get-github-repositories', isAuthenticated, (req, res) => {
            if (req.user && req.user.githubRepositories) {
                res.json({
                    repositories: req.user.githubRepositories,
                    username: req.user.username
                });
            } else {
                res.json({ repositories: [], username: req.user?.username });
            }
        });
        
        // Add ability to refresh GitHub repositories
        server.post('/refresh-github-repositories', isAuthenticated, async (req, res) => {
            if (!req.user || !req.user.githubToken) {
                return res.status(401).json({ error: 'GitHub credentials not found' });
            }
            
            try {
                const reposResponse = await axios.get('https://api.github.com/user/repos', {
                    headers: {
                        'Authorization': `token ${req.user.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    params: {
                        sort: 'updated',
                        per_page: 100
                    }
                });
                
                if (reposResponse.status === 200) {
                    // Update repositories for current user
                    const repositories = reposResponse.data.map(repo => ({
                        id: repo.id,
                        name: repo.name,
                        fullName: repo.full_name,
                        description: repo.description,
                        url: repo.html_url,
                        language: repo.language,
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        isPrivate: repo.private,
                        updatedAt: repo.updated_at
                    }));
                    
                    req.user.githubRepositories = repositories;
                    
                    // Update the user in the users array
                    const userIndex = users.findIndex(u => u.id === req.user.id);
                    if (userIndex !== -1) {
                        users[userIndex].githubRepositories = repositories;
                    }
                    
                    // Update in the database
                    await pool.query(
                        'UPDATE users SET github_repositories = $1 WHERE id = $2',
                        [JSON.stringify(repositories), req.user.id]
                    );
                    
                    res.json({ 
                        message: 'GitHub repositories refreshed',
                        count: repositories.length,
                        repositories: repositories
                    });
                } else {
                    res.status(500).json({ error: 'Failed to fetch repositories' });
                }
            } catch (error) {
                console.error('Error refreshing GitHub repositories:', error.message);
                res.status(500).json({ error: 'Error retrieving GitHub repositories' });
            }
        });

        // User authentication routes
        server.get('/api/auth/status', (req, res) => {
            if (req.isAuthenticated()) {
                res.json({ 
                    isAuthenticated: true, 
                    user: req.user 
                });
            } else {
                res.json({ 
                    isAuthenticated: false 
                });
            }
        });

        server.post('/register', async (req, res) => {
            console.log(req.body);
            const email = req.body.email;
            const password = req.body.password;
            const username = req.body.username;
            const role = req.body.role || 'freelancer';
            
            try {
                // Check if user already exists
                const existingUser = users.find(user => user.email === email);
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                
                // Create a new user
                const user = new User(email, username, password, role);
                
                // Insert into database
                await pool.query(
                    'INSERT INTO users(id, email, username, password, role, profile) VALUES($1, $2, $3, $4, $5, $6)',
                    [user.id, user.email, user.username, user.password, user.role, JSON.stringify(user.profile)]
                );
                
                // Add to in-memory array
                users.push(user);
                
                // Log the user in after registration
                req.login(user, (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Login failed after registration' });
                    }
                    return res.json({ message: 'Registration successful', user });
                });
            } catch (error) {
                console.error('Error registering user:', error);
                res.status(500).json({ error: 'Registration failed' });
            }
        });

        // User routes
        server.get('/get-user', (req, res) => {
            if (req.isAuthenticated()) {
                res.json(req.user);
            } else {
                res.status(401).json({ error: 'Not logged in' });
            }
        });

        server.post('/login', (req, res) => {
            const user = users.find(user => user.email === req.body.email && user.password === req.body.password);
            if (user) {
                // Regenerate the session before logging in to prevent session fixation
                const oldSession = req.session;
                req.session.regenerate((err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Login failed' });
                    }
                    
                    // Log the user in
                    req.login(user, (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Login failed' });
                        }
                        res.json({ message: 'Login successful', user });
                    });
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });

        server.get('/auth/logout', (req, res) => {
            req.logout((err) => {
                if (err) {
                    console.error('Logout Error', err);
                    return res.status(500).json({ error: 'Logout failed' });
                }
                
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Session destruction error', err);
                        return res.status(500).json({ error: 'Logout failed' });
                    }
                    res.clearCookie('job_portal_session');
                    res.json({ message: 'Logged out successfully' });
                });
            });
        });

        // Profile routes
        server.post('/update-profile', isAuthenticated, async (req, res) => {
            const profileData = req.body;
            if (req.user) {
                try {
                    // Update profile in memory
                    req.user.profile = { ...req.user.profile, ...profileData };
                    
                    // Update the user in the users array
                    const userIndex = users.findIndex(u => u.id === req.user.id);
                    if (userIndex !== -1) {
                        users[userIndex].profile = req.user.profile;
                    }
                    
                    // Update in database
                    await pool.query(
                        'UPDATE users SET profile = $1 WHERE id = $2',
                        [JSON.stringify(req.user.profile), req.user.id]
                    );
                    
                    res.json({ message: 'Profile updated successfully', profile: req.user.profile });
                } catch (error) {
                    console.error('Error updating profile:', error);
                    res.status(500).json({ error: 'Failed to update profile' });
                }
            } else {
                res.status(401).json({ error: 'User not authenticated' });
            }
        });

        server.get('/get-profile', isAuthenticated, (req, res) => {
            if (req.user) {
                res.json(req.user.profile);
            } else {
                res.status(401).json({ error: 'User not authenticated' });
            }
        });

        // Job routes
        server.post('/createjob', isAuthenticated, async (req, res) => {
            console.log(req.body);
            if (req.user && req.user.role === 'client') {
                try {
                    const job = new Job(
                        req.body.title,
                        req.body.description,
                        req.body.type,
                        req.body.location,
                        req.body.qualifications,
                        req.body.experience,
                        req.body.skills || [],
                        req.body.salaryRange,
                        req.body.benefits,
                        req.body.timerDuration,
                        req.body.autoRenew,
                        {
                            id: req.user.id,
                            username: req.user.username,
                            email: req.user.email
                        }
                    );
                    
                    // Insert into database
                    await pool.query(
                        'INSERT INTO jobs(id, title, description, type, location, qualifications, experience, skills, salary_range, benefits, timer_duration, auto_renew, client, created_at, expiry_time, applications, status, apply_clicks) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
                        [
                            job.id, job.title, job.description, job.type, job.location, 
                            job.qualifications, job.experience, JSON.stringify(job.skills), 
                            job.salaryRange, job.benefits, job.timerDuration, job.autoRenew, 
                            JSON.stringify(job.client), job.createdAt, job.expiryTime, 
                            JSON.stringify(job.applications), job.status, job.applyClicks
                        ]
                    );
                    
                    // Add to in-memory array
                    jobs.push(job);

                    // Notify users whose alert preferences match at least 50% of the job's skills
                    const jobSkills = job.skills.map(skill => skill.toLowerCase());
                    
                    // First collect all users who should receive notifications
                    const usersToNotify = [];
                    
                    users.forEach(user => {
                        if (user.alertPreferences?.enabled && user.alertPreferences.skills?.length > 0) {
                            const userSkills = user.alertPreferences.skills.map(skill => skill.toLowerCase());
                            const matchingSkills = userSkills.filter(skill => jobSkills.includes(skill));
                            const matchPercentage = (matchingSkills.length / jobSkills.length) * 100;

                            if (matchPercentage >= 50) {
                                // Make sure we don't have an existing notification for this user and job
                                const hasExistingNotification = notifications.some(n => 
                                    n.userId === user.id &&
                                    n.type === 'job-alert' &&
                                    n.message.includes(job.title)
                                );
                                
                                if (!hasExistingNotification) {
                                    usersToNotify.push({
                                        user,
                                        matchingSkills
                                    });
                                }
                            }
                        }
                    });
            
                    // Now create notifications for collected users
                    for (const { user, matchingSkills } of usersToNotify) {
                        const notification = new Notification(
                            user.id,
                            `A new job "${job.title}" matches your skills (${matchingSkills.join(', ')})`,
                            'job-alert'
                        );
                        
                        // Save notification to database
                        await pool.query(
                            'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                            [
                                notification.id, notification.userId, notification.message, 
                                notification.type, notification.isRead, notification.createdAt
                            ]
                        );
                        
                        // Add to in-memory array
                        notifications.push(notification);

                        // Send real-time notification via WebSocket
                        io.to(user.id).emit('job_alert', { 
                            message: notification.message,
                            jobId: job.id,
                            jobTitle: job.title
                        });
                    }

                    res.status(201).json({ message: 'Job created successfully', job });
                } catch (error) {
                    console.error('Error creating job:', error);
                    res.status(500).json({ error: 'Failed to create job' });
                }
            } else {
                res.status(403).json({ error: 'Only clients can create jobs' });
            }
        });

        server.get('/get-jobs', (req, res) => {
            res.json(jobs);
        });

        server.get('/get-job/:id', (req, res) => {
            const job = jobs.find(j => j.id === req.params.id);
            if (job) {
                res.json(job);
            } else {
                res.status(404).json({ error: 'Job not found' });
            }
        });

        server.post('/update-job/:id', isAuthenticated, async (req, res) => {
            const jobId = req.params.id;
            const jobIndex = jobs.findIndex(j => j.id === jobId && j.client.id === req.user.id);
            
            if (jobIndex !== -1) {
                // Only update allowed fields
                const updatedJob = {
                    ...jobs[jobIndex],
                    title: req.body.title || jobs[jobIndex].title,
                    description: req.body.description || jobs[jobIndex].description,
                    type: req.body.type || jobs[jobIndex].type,
                    location: req.body.location || jobs[jobIndex].location,
                    qualifications: req.body.qualifications || jobs[jobIndex].qualifications,
                    experience: req.body.experience || jobs[jobIndex].experience,
                    skills: req.body.skills || jobs[jobIndex].skills,
                    salaryRange: req.body.salaryRange || jobs[jobIndex].salaryRange,
                    benefits: req.body.benefits || jobs[jobIndex].benefits,
                    applicationDeadline: req.body.applicationDeadline || jobs[jobIndex].applicationDeadline,
                    autoRenew: req.body.autoRenew !== undefined ? req.body.autoRenew : jobs[jobIndex].autoRenew,
                    status: req.body.status || jobs[jobIndex].status
                };
                
                jobs[jobIndex] = updatedJob;

                // Update in database
                await pool.query(
                    'UPDATE jobs SET title = $1, description = $2, type = $3, location = $4, qualifications = $5, experience = $6, skills = $7, salary_range = $8, benefits = $9, application_deadline = $10, auto_renew = $11, status = $12 WHERE id = $13',
                    [
                        updatedJob.title, updatedJob.description, updatedJob.type, updatedJob.location, 
                        updatedJob.qualifications, updatedJob.experience, JSON.stringify(updatedJob.skills), 
                        updatedJob.salaryRange, updatedJob.benefits, updatedJob.applicationDeadline, 
                        updatedJob.autoRenew, updatedJob.status, updatedJob.id
                    ]
                );

                res.json({ message: 'Job updated successfully', job: updatedJob });
            } else {
                res.status(404).json({ error: 'Job not found or you do not have permission to edit it' });
            }
        });

        server.delete('/delete-job/:id', isAuthenticated, async (req, res) => {
            const jobId = req.params.id;
            const jobIndex = jobs.findIndex(j => j.id === jobId && j.client.id === req.user.id);
            
            if (jobIndex !== -1) {
                const deletedJob = jobs.splice(jobIndex, 1)[0];
                
                // Remove from database
                await pool.query('DELETE FROM jobs WHERE id = $1', [jobId]);
                
                // Also remove related applications
                applications = applications.filter(app => app.jobId !== jobId);
                await pool.query('DELETE FROM applications WHERE job_id = $1', [jobId]);

                res.json({ message: 'Job deleted successfully', job: deletedJob });
            } else {
                res.status(404).json({ error: 'Job not found or you do not have permission to delete it' });
            }
        });

        // Application routes
        server.post('/apply-job/:id', isAuthenticated, async (req, res) => {
            if (req.user.role !== 'freelancer') {
                return res.status(403).json({ error: 'Only freelancers can apply for jobs' });
            }
            
            const uploadFields = [
                { name: 'genericResume', maxCount: 1 },
                { name: 'jobSpecificResume', maxCount: 1 },
                { name: 'coverLetterFile', maxCount: 1 }
            ];
            
            const uploadMiddleware = upload.fields(uploadFields);
            
            uploadMiddleware(req, res, async (err) => {
                if (err) {
                    console.error("File upload error:", err);
                    return res.status(400).json({ error: err.message });
                }
                
                try {
                    const jobId = req.params.id;
                    const job = jobs.find(j => j.id === jobId);
                    
                    if (!job) {
                        // Clean up uploaded files if job not found
                        if (req.files) {
                            Object.values(req.files).forEach(files => {
                                files.forEach(file => {
                                    fs.unlinkSync(file.path);
                                });
                            });
                        }
                        return res.status(404).json({ error: 'Job not found' });
                    }
                    
                    // Check if already applied
                    const existingApplication = applications.find(
                        app => app.jobId === jobId && app.freelancer.id === req.user.id
                    );
                    
                    if (existingApplication) {
                        // Clean up uploaded files if already applied
                        if (req.files) {
                            Object.values(req.files).forEach(files => {
                                files.forEach(file => {
                                    fs.unlinkSync(file.path);
                                });
                            });
                        }
                        return res.status(400).json({ error: 'You have already applied for this job' });
                    }
                    
                    const fileDetails = {
                        genericResumePath: req.files.genericResume ? req.files.genericResume[0].path : null,
                        jobSpecificResumePath: req.files.jobSpecificResume ? req.files.jobSpecificResume[0].path : null,
                        coverLetterFilePath: req.files.coverLetterFile ? req.files.coverLetterFile[0].path : null
                    };
                    
                    if (!fileDetails.genericResumePath) {
                        return res.status(400).json({ error: 'Generic resume is required' });
                    }
                    
                    const application = new JobApplication(
                        jobId,
                        {
                            id: req.user.id,
                            username: req.user.username,
                            email: req.user.email
                        },
                        req.body.coverLetter,
                        fileDetails
                    );
                    
                    applications.push(application);
                    job.applications.push(application.id);
                    
                    // Insert into database
                    await pool.query(
                        'INSERT INTO applications(id, job_id, freelancer, cover_letter, generic_resume_path, job_specific_resume_path, cover_letter_file_path, status, submitted_at, interview_date_time, interview_message) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                        [
                            application.id, application.jobId, JSON.stringify(application.freelancer), 
                            application.coverLetter, application.genericResumePath, application.jobSpecificResumePath, 
                            application.coverLetterFilePath, application.status, application.submittedAt, 
                            application.interviewDateTime, application.interviewMessage
                        ]
                    );
                    
                    // Create notification for the job owner
                    const notification = new Notification(
                        job.client.id,
                        `New application received for "${job.title}" from ${req.user.username}`,
                        'job-application'
                    );
                    notifications.push(notification);
                    
                    // Insert notification into database
                    await pool.query(
                        'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                        [
                            notification.id, notification.userId, notification.message, 
                            notification.type, notification.isRead, notification.createdAt
                        ]
                    );
                    
                    res.status(201).json({ message: 'Application submitted successfully', application });
                } catch (error) {
                    console.error("Error in application submission:", error);
                    // Clean up uploaded files on error 
                    if (req.files) {
                        Object.values(req.files).forEach(files => {
                            files.forEach(file => {
                                fs.unlinkSync(file.path);
                            });
                        });
                    }
                    res.status(500).json({ error: 'Server error processing your application' });
                }
            });
        });

        // Serve uploaded files
        server.get('/uploads/:userId/:filename', isAuthenticated, (req, res) => {
            const { userId, filename } = req.params;
            
            // Security check - only allow access to files if:
            // 1. The user is accessing their own files
            // 2. The user is a client viewing files from an application to their job
            let hasAccess = req.user.id === userId;
            
            if (!hasAccess && req.user.role === 'client') {
                // Check if this is a file from an application to the client's job
                const application = applications.find(app => {
                    // Look for application where:
                    // 1. The freelancer ID matches the userId in the URL
                    // 2. The file path contains the filename
                    const isFreelancerFile = app.freelancer.id === userId;
                    const hasFile = (
                        (app.genericResumePath && app.genericResumePath.includes(filename)) ||
                        (app.jobSpecificResumePath && app.jobSpecificResumePath.includes(filename)) ||
                        (app.coverLetterFilePath && app.coverLetterFilePath.includes(filename))
                    );
                    
                    if (isFreelancerFile && hasFile) {
                        // Check if this application is for a job owned by the requesting client
                        const job = jobs.find(j => j.id === app.jobId && j.client.id === req.user.id);
                        return job !== undefined;
                    }
                    
                    return false;
                });
                hasAccess = application !== undefined;
            }
            
            if (!hasAccess) {
                return res.status(403).json({ error: 'You do not have permission to access this file' });
            }
            
            const filePath = path.join(uploadDir, userId, filename);
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            res.sendFile(filePath);
        });

        server.get('/get-applications', isAuthenticated, (req, res) => {
            if (req.user.role === 'client') {
                // Get all applications for jobs posted by this client
                const clientJobs = jobs.filter(job => job.client.id === req.user.id);
                const jobIds = clientJobs.map(job => job.id);
                const jobApplications = applications.filter(app => jobIds.includes(app.jobId));
                
                // Add job title to each application for easier frontend display
                const enrichedApplications = jobApplications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    const interview = interviews.find(i => i.applicationId === app.id);
                    return {
                        ...app,
                        jobTitle: job ? job.title : 'Unknown Job',
                        interviewDateTime: interview?.dateTime,
                        interviewMessage: interview?.message,
                        genericResumePath: app.genericResumePath,
                        jobSpecificResumePath: app.jobSpecificResumePath,
                        coverLetterFilePath: app.coverLetterFilePath
                    };
                });
                
                res.json(enrichedApplications);
            } else if (req.user.role === 'freelancer') {
                // Get all applications submitted by this freelancer
                const userApplications = applications.filter(app => app.freelancer.id === req.user.id);
                
                // Add job title to each application
                const enrichedApplications = userApplications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    const interview = interviews.find(i => i.applicationId === app.id);
                    return {
                        ...app,
                        jobTitle: job ? job.title : 'Unknown Job',
                        client: job ? job.client : null,
                        interviewDateTime: interview?.dateTime,
                        interviewMessage: interview?.message,
                        genericResumePath: app.genericResumePath,
                        jobSpecificResumePath: app.jobSpecificResumePath,
                        coverLetterFilePath: app.coverLetterFilePath
                    };
                });
                res.json(enrichedApplications);
            } else {
                res.status(403).json({ error: 'Unauthorized' });
            }
        });

        server.get('/get-applications/:jobId', isAuthenticated, (req, res) => {
            const jobId = req.params.jobId;
            const job = jobs.find(j => j.id === jobId);
            
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }
            
            // Check if the user is the job owner
            if (req.user.role === 'client' && job.client.id === req.user.id) {
                const jobApplications = applications.filter(app => app.jobId === jobId);
                
                // Add job title to each application for easier frontend display
                const enrichedApplications = jobApplications.map(app => {
                    const interview = interviews.find(i => i.applicationId === app.id);
                    return {
                        ...app,
                        jobTitle: job.title,
                        interviewDateTime: interview?.dateTime,
                        interviewMessage: interview?.message,
                        genericResumePath: app.genericResumePath,
                        jobSpecificResumePath: app.jobSpecificResumePath,
                        coverLetterFilePath: app.coverLetterFilePath
                    };
                });
                res.json(enrichedApplications);
            } else {
                res.status(403).json({ error: 'You do not have permission to view these applications' });
            }
        });

        server.post('/update-application-status/:id', isAuthenticated, async (req, res) => {
            const applicationId = req.params.id;
            const status = req.body.status;
            
            if (!['accepted', 'rejected'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected".' });
            }
            
            const applicationIndex = applications.findIndex(app => app.id === applicationId);
            
            if (applicationIndex === -1) {
                return res.status(404).json({ error: 'Application not found' });
            }
            
            const application = applications[applicationIndex];
            const job = jobs.find(j => j.id === application.jobId);
            
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }
            
            // Check if the user is the job owner
            if (req.user.role !== 'client' || job.client.id !== req.user.id) {
                return res.status(403).json({ error: 'You do not have permission to update this application' });
            }
                
            application.status = status;
            applications[applicationIndex] = application;
            
            // Update in database
            await pool.query(
                'UPDATE applications SET status = $1 WHERE id = $2',
                [status, application.id]
            );
            
            // Create notification for the freelancer
            const notification = new Notification(
                application.freelancer.id,
                `Your application for "${job.title}" has been ${status}`,
                'status-update'
            );
            notifications.push(notification);
            
            // Insert notification into database
            await pool.query(
                'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                [
                    notification.id, notification.userId, notification.message, 
                    notification.type, notification.isRead, notification.createdAt
                ]
            );
            
            // If application is accepted, create initial chat messages to establish connection
            if (status === 'accepted') {
                // Create system messages for both users to establish chat connection
                const clientToFreelancerMsg = new ChatMessage(
                    job.client.id, 
                    application.freelancer.id, 
                    `Hello! I've accepted your application for "${job.title}". Let's discuss the details.`,
                    false
                );
                
                const freelancerToClientMsg = new ChatMessage(
                    application.freelancer.id,
                    job.client.id,
                    `Thank you for accepting my application for "${job.title}". I'm looking forward to working with you.`,
                    false
                );
                chatMessages.push(clientToFreelancerMsg);
                chatMessages.push(freelancerToClientMsg);
                
                // Insert chat messages into database
                await pool.query(
                    'INSERT INTO chat_messages(id, sender_id, receiver_id, content, read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                    [
                        clientToFreelancerMsg.id, clientToFreelancerMsg.senderId, clientToFreelancerMsg.receiverId, 
                        clientToFreelancerMsg.content, clientToFreelancerMsg.read, clientToFreelancerMsg.createdAt
                    ]
                );
                await pool.query(
                    'INSERT INTO chat_messages(id, sender_id, receiver_id, content, read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                    [
                        freelancerToClientMsg.id, freelancerToClientMsg.senderId, freelancerToClientMsg.receiverId, 
                        freelancerToClientMsg.content, freelancerToClientMsg.read, freelancerToClientMsg.createdAt
                    ]
                );
                
                // Create additional notifications to prompt users to check their messages
                const chatNotificationToFreelancer = new Notification(
                    application.freelancer.id,
                    `You have a new message from ${job.client.username} regarding "${job.title}"`,
                    'message'
                );
                
                const chatNotificationToClient = new Notification(
                    job.client.id,
                    `Chat has been established with ${application.freelancer.username} for "${job.title}"`,
                    'message'
                );
                notifications.push(chatNotificationToFreelancer);
                notifications.push(chatNotificationToClient);
                
                // Insert chat notifications into database
                await pool.query(
                    'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                    [
                        chatNotificationToFreelancer.id, chatNotificationToFreelancer.userId, chatNotificationToFreelancer.message, 
                        chatNotificationToFreelancer.type, chatNotificationToFreelancer.isRead, chatNotificationToFreelancer.createdAt
                    ]
                );
                await pool.query(
                    'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                    [
                        chatNotificationToClient.id, chatNotificationToClient.userId, chatNotificationToClient.message, 
                        chatNotificationToClient.type, chatNotificationToClient.isRead, chatNotificationToClient.createdAt
                    ]
                );
            }
            
            res.json({ message: 'Application status updated', application });
        });

        // Interview routes
        server.post('/schedule-interview/:applicationId', isAuthenticated, async (req, res) => {
            const applicationId = req.params.applicationId;
            const { dateTime, message, scheduleNow } = req.body;
            
            // Find the application
            const applicationIndex = applications.findIndex(app => app.id === applicationId);
            
            if (applicationIndex === -1) {
                return res.status(404).json({ error: 'Application not found' });
            }
            
            const application = applications[applicationIndex];
            const job = jobs.find(j => j.id === application.jobId);
            
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }
            
            // Check if the user is the job owner
            if (req.user.role !== 'client' || job.client.id !== req.user.id) {
                return res.status(403).json({ error: 'You do not have permission to schedule an interview for this application' });
            }
            
            // Update application status to accepted
            application.status = 'accepted';
            applications[applicationIndex] = application;
            
            // Update in database
            await pool.query(
                'UPDATE applications SET status = $1 WHERE id = $2',
                ['accepted', application.id]
            );
            
            // Create notification for the freelancer
            let notificationMessage;
            // Create a system message about the interview
            if (scheduleNow && dateTime) {
                // Create a new interview
                const interview = new Interview(
                    applicationId,
                    job,
                    application.freelancer,
                    job.client,
                    dateTime,
                    message
                );
                interviews.push(interview);
                
                // Update application with interview details
                application.interviewDateTime = dateTime;
                application.interviewMessage = message;
                applications[applicationIndex] = application;
                
                // Insert interview into database
                await pool.query(
                    'INSERT INTO interviews(id, application_id, job_id, job_title, freelancer_id, freelancer_name, client_id, client_name, date_time, message, status, created_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                    [
                        interview.id, interview.applicationId, interview.jobId, interview.jobTitle, 
                        interview.freelancerId, interview.freelancerName, interview.clientId, interview.clientName, 
                        interview.dateTime, interview.message, interview.status, interview.createdAt
                    ]
                );
                
                notificationMessage = `Interview scheduled for "${job.title}" on ${new Date(dateTime).toLocaleString()}. ${message || ''}`;
                
                // Create a system message about the interview
                const interviewChatMsg = new ChatMessage(
                    job.client.id,
                    application.freelancer.id,
                    `I've scheduled an interview for "${job.title}" on ${new Date(dateTime).toLocaleString()}. ${message ? `Additional info: ${message}` : ''}`,
                    false
                );
                chatMessages.push(interviewChatMsg);
                
                // Insert chat message into database
                await pool.query(
                    'INSERT INTO chat_messages(id, sender_id, receiver_id, content, read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                    [
                        interviewChatMsg.id, interviewChatMsg.senderId, interviewChatMsg.receiverId, 
                        interviewChatMsg.content, interviewChatMsg.read, interviewChatMsg.createdAt
                    ]
                );
            } else {
                notificationMessage = `Your application for "${job.title}" has been accepted. The employer will schedule an interview soon.`;
                
                // Create initial chat messages to establish connection if they don't exist already
                const existingChat = chatMessages.some(msg => 
                    (msg.senderId === job.client.id && msg.receiverId === application.freelancer.id) || 
                    (msg.senderId === application.freelancer.id && msg.receiverId === job.client.id)
                );
                if (!existingChat) {
                    const clientToFreelancerMsg = new ChatMessage(
                        job.client.id, 
                        application.freelancer.id, 
                        `Hello! I've accepted your application for "${job.title}". We'll schedule an interview soon.`,
                        false
                    );
                    
                    const freelancerToClientMsg = new ChatMessage(
                        application.freelancer.id,
                        job.client.id,
                        `Thank you for accepting my application for "${job.title}". I'm looking forward to working with you.`,
                        false
                    );
                    
                    chatMessages.push(clientToFreelancerMsg);
                    chatMessages.push(freelancerToClientMsg);
                    
                    // Insert chat messages into database
                    await pool.query(
                        'INSERT INTO chat_messages(id, sender_id, receiver_id, content, read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                        [
                            clientToFreelancerMsg.id, clientToFreelancerMsg.senderId, clientToFreelancerMsg.receiverId, 
                            clientToFreelancerMsg.content, clientToFreelancerMsg.read, clientToFreelancerMsg.createdAt
                        ]
                    );
                    await pool.query(
                        'INSERT INTO chat_messages(id, sender_id, receiver_id, content, read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                        [
                            freelancerToClientMsg.id, freelancerToClientMsg.senderId, freelancerToClientMsg.receiverId, 
                            freelancerToClientMsg.content, freelancerToClientMsg.read, freelancerToClientMsg.createdAt
                        ]
                    );
                }
            }
            
            const notification = new Notification(
                application.freelancer.id,
                notificationMessage,
                'interview-scheduled'
            );
            notifications.push(notification);
            
            // Insert notification into database
            await pool.query(
                'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                [
                    notification.id, notification.userId, notification.message, 
                    notification.type, notification.isRead, notification.createdAt
                ]
            );
            
            // Also create a chat notification
            const chatNotification = new Notification(
                application.freelancer.id,
                `You have a new message from ${job.client.username} regarding "${job.title}"`,
                'message'
            );
            notifications.push(chatNotification);
            
            // Insert chat notification into database
            await pool.query(
                'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                [
                    chatNotification.id, chatNotification.userId, chatNotification.message, 
                    chatNotification.type, chatNotification.isRead, chatNotification.createdAt
                ]
            );
            
            res.json({ message: 'Application accepted and interview ' + (scheduleNow ? 'scheduled' : 'pending'), application });
        });

        server.get('/get-interviews', isAuthenticated, (req, res) => {
            let userInterviews;
            if (req.user.role === 'client') {
                // Get interviews where this user is the client
                userInterviews = interviews.filter(interview => interview.clientId === req.user.id);
            } else {
                // Get interviews where this user is the freelancer
                userInterviews = interviews.filter(interview => interview.freelancerId === req.user.id);
            }
            
            // Sort by date (most recent first)
            userInterviews.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
            
            res.json(userInterviews);
        });

        // Notification routes
        server.get('/get-notifications', isAuthenticated, (req, res) => {
            const userNotifications = notifications.filter(n => n.userId === req.user.id);
            res.json(userNotifications);
        });

        server.post('/mark-notification-read/:id', isAuthenticated, async (req, res) => {
            const notificationId = req.params.id; 
            const notificationIndex = notifications.findIndex(
                n => n.id === notificationId && n.userId === req.user.id
            );
            
            if (notificationIndex !== -1) {
                notifications[notificationIndex].isRead = true;
                
                // Update in database
                await pool.query(
                    'UPDATE notifications SET is_read = $1 WHERE id = $2',
                    [true, notificationId]
                );
                
                res.json({ message: 'Notification marked as read', notification: notifications[notificationIndex] });
            } else {
                res.status(404).json({ error: 'Notification not found' });
            }
        });

        server.post('/mark-all-notifications-read', isAuthenticated, async (req, res) => {
            let count = 0;
            notifications.forEach((notification, index) => {
                if (notification.userId === req.user.id && !notification.isRead) {
                    notifications[index].isRead = true;
                    count++;
                }
            });
            
            // Update in database
            await pool.query(
                'UPDATE notifications SET is_read = $1 WHERE user_id = $2',
                [true, req.user.id]
            );
            
            res.json({ message: `${count} notifications marked as read` });
        });

        // Add debugging route
        server.get('/debug-session', (req, res) => {
            res.json({
                isAuthenticated: req.isAuthenticated(),
                sessionID: req.sessionID,
                user: req.user ? {
                    id: req.user.id,
                    username: req.user.username, 
                    email: req.user.email,
                    role: req.user.role
                } : null
            });
        });

        server.get('/get-company/:id', (req, res) => {
            const userId = req.params.id;
            const user = users.find(u => u.id === userId && u.role === 'client');
            
            if (user) {
                // Return only necessary and public information about the company
                const companyData = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    profile: user.profile || {}
                };
                res.json(companyData);
            } else {
                res.status(404).json({ error: 'Company not found' });
            }
        });

        // Routes for saved jobs
        server.post('/save-job/:id', isAuthenticated, async (req, res) => {
            const jobId = req.params.id;
            const userId = req.user.id;
            
            // Check if job exists
            const job = jobs.find(j => j.id === jobId);
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }
            
            // Check if already saved
            const existingSave = savedJobs.find(sj => sj.jobId === jobId && sj.userId === userId);
            if (existingSave) {
                return res.status(400).json({ error: 'Job already saved', savedJob: existingSave });
            }
            
            // Create new saved job
            const savedJob = new SavedJob(userId, jobId, new Date().toISOString());
            savedJobs.push(savedJob);
            
            // Insert into database
            await pool.query(
                'INSERT INTO saved_jobs(id, user_id, job_id, saved_at) VALUES($1, $2, $3, $4)',
                [savedJob.id, savedJob.userId, savedJob.jobId, savedJob.savedAt]
            );
            
            res.status(201).json({ message: 'Job saved successfully', savedJob });
        });

        server.delete('/unsave-job/:id', isAuthenticated, async (req, res) => {
            const jobId = req.params.id;
            const userId = req.user.id;
            
            const index = savedJobs.findIndex(sj => sj.jobId === jobId && sj.userId === userId);
            if (index === -1) {
                return res.status(404).json({ error: 'Saved job not found' });
            }
            
            const removedJob = savedJobs.splice(index, 1)[0];
            
            // Remove from database
            await pool.query('DELETE FROM saved_jobs WHERE id = $1', [removedJob.id]);
            
            res.json({ message: 'Job removed from saved jobs', savedJob: removedJob });
        });

        server.get('/saved-jobs', isAuthenticated, (req, res) => {
            const userSavedJobs = savedJobs.filter(sj => sj.userId === req.user.id);
            
            // Enrich with job details
            const enrichedSavedJobs = userSavedJobs.map(savedJob => {
                const job = jobs.find(j => j.id === savedJob.jobId);
                return {
                    ...savedJob,
                    job
                };
            });
            res.json(enrichedSavedJobs);
        });

        server.get('/is-job-saved/:id', isAuthenticated, (req, res) => {
            const jobId = req.params.id;
            const userId = req.user.id;
            const isSaved = savedJobs.some(sj => sj.jobId === jobId && sj.userId === userId);
            res.json({ isSaved });
        });

        // Routes for ratings and reviews
        server.post('/rate-client/:clientId', isAuthenticated, async (req, res) => {
            if (req.user.role !== 'freelancer') {
                return res.status(403).json({ error: 'Only freelancers can rate clients' });
            }
            
            const clientId = req.params.clientId;
            const { jobId, applicationId, stars, comment } = req.body;
            
            // Validate input
            if (!stars || stars < 1 || stars > 5) {
                return res.status(400).json({ error: 'Stars must be between 1 and 5' });
            }
            
            // Check if application exists and is completed
            const application = applications.find(a => a.id === applicationId);
            if (!application) {
                return res.status(404).json({ error: 'Application not found' });
            }
            
            // Check if application is completed or rejected
            if (application.status !== 'accepted' && application.status !== 'rejected') {
                return res.status(400).json({ error: 'You can only rate after the application process is completed' });
            }
            
            // Check if user has already rated this application
            const existingRating = ratings.find(r => 
                r.applicationId === applicationId && r.freelancerId === req.user.id
            );
            
            if (existingRating) {
                // Update existing rating
                existingRating.stars = stars;
                existingRating.comment = comment;
                
                // Update in database
                await pool.query(
                    'UPDATE ratings SET stars = $1, comment = $2 WHERE id = $3',
                    [stars, comment, existingRating.id]
                );
                
                return res.json({ 
                    message: 'Rating updated successfully', 
                    rating: existingRating 
                });
            }
            
            // Create new rating
            const rating = new Rating(
                req.user.id,
                clientId,
                jobId,
                applicationId,
                stars,
                comment
            );
            ratings.push(rating);
            
            // Insert into database
            await pool.query(
                'INSERT INTO ratings(id, freelancer_id, client_id, job_id, application_id, stars, comment, created_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
                [
                    rating.id, rating.freelancerId, rating.clientId, rating.jobId, 
                    rating.applicationId, rating.stars, rating.comment, rating.createdAt
                ]
            );
            
            // Create notification for the client
            const notification = new Notification(
                clientId,
                `You have received a ${stars}-star rating from ${req.user.username}`,
                'rating'
            );
            notifications.push(notification);
            
            // Insert notification into database
            await pool.query(
                'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                [
                    notification.id, notification.userId, notification.message, 
                    notification.type, notification.isRead, notification.createdAt
                ]
            );
            
            res.status(201).json({ message: 'Rating submitted successfully', rating });
        });

        async function getGroqChatCompletion(query) {
            return groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: query,
                    },
                ],
                model: "llama-3.3-70b-versatile",
            });
        }
        
        // Middleware for file upload
        server.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 }, // Increase limit to 50MB
            abortOnLimit: true
        }));
        server.use(express.static(path.join(__dirname, 'public')));
        
        // Endpoint to handle PDF upload and extract text
        server.post('/analyze-file', async (req, res) => {
            console.log('Received request to analyze file.');
            if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
            }
        
            try {
            const uploadedFile = req.files.file;
            const analysisType = req.body.type || 'resume'; // Get the analysis type from request
            console.log('Processing file:', uploadedFile.name, 'Size:', uploadedFile.size, 'Type:', analysisType);
            
            // Extract text from PDF
            const pdfData = await pdfParse(uploadedFile.data);
            console.log('PDF text extraction successful.');
            
            // Generate different prompts based on analysis type
            let prompt = "";
            switch (analysisType) {
                case 'resume':
                prompt = "What can get better in this resume and give response in 100 words: ";
                break;
                case 'cover-letter':
                prompt = "Review this cover letter and suggest improvements in 100 words: ";
                break;
                default:
                prompt = "Analyze this document and provide feedback in 100 words: ";
            }
            
            // Get AI analysis
            const chatCompletion = await getGroqChatCompletion(prompt + pdfData.text);
            const responseContent = chatCompletion.choices[0]?.message?.content || "No response";
            
            // Send JSON response
            return res.json({ text: responseContent });
            } catch (error) {
            console.error('Error processing file:', error);
            return res.status(500).json({ error: 'Error processing file: ' + error.message });
            }
        });

        server.get('/client-ratings/:clientId', async (req, res) => {
            const clientId = req.params.clientId;
            
            // Check if client exists
            const clientExists = users.some(u => u.id === clientId && u.role === 'client');
            if (!clientExists) {
                return res.status(404).json({ error: 'Client not found' });
            }
            
            // Get all ratings for this client
            const clientRatings = ratings.filter(r => r.clientId === clientId);
            
            // Calculate average rating
            const totalStars = clientRatings.reduce((sum, rating) => sum + rating.stars, 0);
            const averageRating = clientRatings.length > 0 ? (totalStars / clientRatings.length).toFixed(1) : 0;
            
            // Enrich ratings with freelancer info and ensure comments (reviews) are included
            const enrichedRatings = clientRatings.map(rating => {
                const freelancer = users.find(u => u.id === rating.freelancerId);
                const job = jobs.find(j => j.id === rating.jobId);
                
                return {
                    id: rating.id,
                    stars: rating.stars,
                    comment: rating.comment, // Include the review/comment
                    createdAt: rating.createdAt,
                    freelancer: freelancer ? {
                        id: freelancer.id,
                        username: freelancer.username,
                        profilePicture: freelancer.profile?.profilePicture
                    } : null,
                    job: job ? {
                        id: job.id,
                        title: job.title
                    } : null
                };
            });
            
            // Sort by date (most recent first)
            enrichedRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            res.json({
                ratings: enrichedRatings,
                reviews: enrichedRatings.filter(r => r.comment && r.comment.trim() !== ''), // Include only ratings with comments as reviews
                averageRating,
                totalRatings: clientRatings.length,
                totalReviews: enrichedRatings.filter(r => r.comment && r.comment.trim() !== '').length
            });
        });

        server.get('/my-submitted-ratings', isAuthenticated, (req, res) => {
            if (req.user.role !== 'freelancer') {
                return res.status(403).json({ error: 'Only freelancers can view their submitted ratings' });
            }
            
            const userRatings = ratings.filter(r => r.freelancerId === req.user.id);
            
            // Enrich ratings with client and job info
            const enrichedRatings = userRatings.map(rating => {
                const client = users.find(u => u.id === rating.clientId);
                const job = jobs.find(j => j.id === rating.jobId);
                
                return {
                    ...rating,
                    client: client ? {
                        id: client.id,
                        username: client.username
                    } : null,
                    job: job ? {
                        id: job.id,
                        title: job.title
                    } : null
                };
            });
            
            // Sort by date (most recent first)
            enrichedRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            res.json(enrichedRatings);
        });

        // Add a route to get badges based on profile completion and other metrics
        server.get('/get-user-badges', isAuthenticated, (req, res) => {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            
            const badges = [];
            
            // Check if user has a complete profile (implement your calculation logic here)
            const profileComplete = calculateProfileCompletion(req.user.profile) === 100;
            if (profileComplete) {
                badges.push({
                    id: 'profile_star',
                    name: 'Profile Star',
                    description: 'Completed 100% of profile information',
                    dateEarned: new Date().toISOString()
                });
            }
            
            // Add other badge checks here (quick response time, etc.)
            
            res.json(badges);
        });

        // Helper function to calculate profile completion percentage
        function calculateProfileCompletion(profile) {
            if (!profile) return 0;

            const requiredFields = [
                'fullName',
                'bio',
                'skills',
                ['contactInfo', 'phone'],
                ['contactInfo', 'location'],
                ['contactInfo', 'website']
            ];
            
            let completedFields = 0;
            for (const field of requiredFields) {
                if (Array.isArray(field)) {
                    // Handle nested fields like contactInfo.phone
                    if (profile[field[0]] && profile[field[0]][field[1]] && 
                        String(profile[field[0]][field[1]]).trim() !== '') {
                        completedFields++;
                    }
                } else if (field === 'skills') {
                    // Special handling for skills array
                    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
                        completedFields++;
                    }
                } else if (profile[field] && String(profile[field]).trim() !== '') {
                    completedFields++;
                }
            }
            
            return Math.round((completedFields / requiredFields.length) * 100);
        }

        // Endpoint to check if a freelancer has completed their profile
        server.get('/get-freelancer-completion/:freelancerId', (req, res) => {
            const freelancerId = req.params.freelancerId;
            
            // Find the freelancer
            const freelancer = users.find(user => user.id === freelancerId && user.role === 'freelancer');
            
            if (!freelancer) {
                return res.status(404).json({ error: 'Freelancer not found' });
            }
            
            // Calculate profile completion
            const isComplete = calculateProfileCompletion(freelancer.profile) === 100;
            
            // Return the completion status and badge information
            res.json({
                isComplete,
                badge: isComplete ? {
                    id: 'profile_star',
                    name: 'Profile Star',
                    description: 'Completed 100% of profile information'
                } : null
            });
        });

        // Chat routes
        server.get('/api/chat/history/:userId', isAuthenticated, (req, res) => {
            const currentUserId = req.user.id;
            const otherUserId = req.params.userId;
             
            // Get messages between these two users
            const messages = chatMessages.filter(msg => 
                (msg.senderId === currentUserId && msg.receiverId === otherUserId) || 
                (msg.senderId === otherUserId && msg.receiverId === currentUserId)
            );
            
            // Sort by date
            messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            res.json(messages);
        });

        // Get all user's chats (conversations)
        server.get('/api/chat/conversations', isAuthenticated, (req, res) => {
            const currentUserId = req.user.id;
            
            // Find all unique users this user has chatted with
            const userMessages = chatMessages.filter(msg => 
                msg.senderId === currentUserId || msg.receiverId === currentUserId
            );
            
            // Get unique user IDs from messages
            const userIds = new Set();
            userMessages.forEach(msg => {
                if (msg.senderId !== currentUserId) userIds.add(msg.senderId);
                if (msg.receiverId !== currentUserId) userIds.add(msg.receiverId);
            });
            
            // Get user details and last message for each conversation
            const conversations = Array.from(userIds).map(userId => {
                const otherUser = users.find(u => u.id === userId);
                if (!otherUser) return null;
                // Find the most recent message between these users
                const relevantMessages = userMessages.filter(msg => 
                    (msg.senderId === userId || msg.receiverId === userId)
                );
                relevantMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const lastMessage = relevantMessages[0];
                
                // Count unread messages
                const unreadCount = relevantMessages.filter(
                    msg => msg.senderId === userId && !msg.read
                ).length;
                
                return {
                    userId: otherUser.id,
                    username: otherUser.username,
                    profilePicture: otherUser.profile?.profilePicture || null,
                    role: otherUser.role,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        createdAt: lastMessage.createdAt,
                        isFromUser: lastMessage.senderId === currentUserId
                    } : null,
                    unreadCount
                };
            }).filter(Boolean);
            
            // Sort by most recent message
            conversations.sort((a, b) => {
                if (!a.lastMessage) return 1;
                if (!b.lastMessage) return -1;
                return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
            });
            
            res.json(conversations);
        });

        // Mark messages as read
        server.post('/api/chat/read/:userId', isAuthenticated, async (req, res) => {
            const currentUserId = req.user.id;
            const otherUserId = req.params.userId;
            
            // Mark messages from other user as read
            let count = 0;
            chatMessages.forEach(msg => {
                if (msg.senderId === otherUserId && msg.receiverId === currentUserId && !msg.read) {
                    msg.read = true;
                    count++;
                }
            });
            
            // Update in database
            await pool.query(
                'UPDATE chat_messages SET read = $1 WHERE sender_id = $2 AND receiver_id = $3',
                [true, otherUserId, currentUserId]
            );
            
            res.json({ success: true, count });
        });

        // Set up Socket.IO connection
        io.on('connection', (socket) => {
            console.log('New client connected');
            let userId = null;
            
            // Authenticate the socket connection
            socket.on('authenticate', (data) => {
                // In a real app, you would verify the token or session
                if (data && data.userId) {
                    userId = data.userId;
                    socket.join(userId); // Join a room with the user's ID
                    console.log(`User ${userId} authenticated`);
                }
            });

            // Handlenew messages
            socket.on('send_message', async (data) => {
                if (!userId) return;
                
                const { receiverId, content } = data;
                if (!receiverId || !content) return;
                
                const message = new ChatMessage(userId, receiverId, content);
                chatMessages.push(message);
                
                // Insert into database
                await pool.query(
                    'INSERT INTO chat_messages(id, sender_id, receiver_id, content, read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
                    [
                        message.id, message.senderId, message.receiverId, 
                        message.content, message.read, message.createdAt
                    ]
                );
                
                // Send to receiver
                socket.to(receiverId).emit('receive_message', message);
                
                // Send back to sender (for confirmation)
                socket.emit('message_sent', message);
            });

            // Handle typing indicator
            socket.on('typing', (data) => {
                if (!userId || !data.receiverId) return;
                socket.to(data.receiverId).emit('user_typing', { userId });
            });

            // Handle stopped typing
            socket.on('stop_typing', (data) => {
                if (!userId || !data.receiverId) return;
                socket.to(data.receiverId).emit('user_stopped_typing', { userId });
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        // Search users endpoint for chat
        server.get('/search-users', isAuthenticated, (req, res) => {
            const { role, query } = req.query;
            const currentUserId = req.user.id;
            
            // Filter users by role and exclude current user
            let filteredUsers = users.filter(user => 
                user.id !== currentUserId && 
                (role ? user.role === role : true)
            );
            
            // Apply search filter if query is provided
            if (query) {
                const searchQuery = query.toLowerCase();
                filteredUsers = filteredUsers.filter(user => 
                    user.username.toLowerCase().includes(searchQuery) || 
                    user.email.toLowerCase().includes(searchQuery) ||
                    (user.profile?.fullName && user.profile.fullName.toLowerCase().includes(searchQuery))
                );
            }
            
            // Limit results and return only necessary fields
            const results = filteredUsers.slice(0, 10).map(user => ({
                id: user.id,
                username: user.username,
                email: user.email || '',
                fullName: user.profile?.fullName || '',
                role: user.role,
                profile: {
                    profilePicture: user.profile?.profilePicture
                }
            }));
            
            res.json(results);
        });

        // Add socket status check endpoint
        server.get('/api/socket-status', (req, res) => {
            const status = io ? {
                running: true,
                connectionsCount: Object.keys(io.sockets.sockets).length,
                serverStartTime: new Date().toISOString()
            } : {
                running: false
            };
            res.json(status);
        });

        // Add a new endpoint to increment applyClicks
        server.post('/increment-apply-clicks/:id', async (req, res) => {
            const jobId = req.params.id;
            const job = jobs.find(j => j.id === jobId);

            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            job.applyClicks += 1; // Increment the applyClicks count

            // Update in database
            await pool.query(
                'UPDATE jobs SET apply_clicks = $1 WHERE id = $2',
                [job.applyClicks, job.id]
            );

            res.json({ message: 'Apply clicks incremented', applyClicks: job.applyClicks });
        });

        // Route to update job alert preferences
        server.post('/update-alert-preferences', isAuthenticated, async (req, res) => {
            const { enabled, skills } = req.body;
            
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            
            // Validate the input
            if (typeof enabled !== 'boolean' || !Array.isArray(skills)) {
                return res.status(400).json({ error: 'Invalid input format' });
            }
            
            // Update the user's alert preferences
            req.user.alertPreferences = {
                enabled,
                skills: skills.map(skill => skill.trim()).filter(skill => skill !== '')
            };
            
            // Update the user in the users array
            const userIndex = users.findIndex(u => u.id === req.user.id);
            if (userIndex !== -1) {
                users[userIndex].alertPreferences = req.user.alertPreferences;
            }
            
            // Update in database
            await pool.query(
                'UPDATE users SET alert_preferences = $1 WHERE id = $2',
                [JSON.stringify(req.user.alertPreferences), req.user.id]
            );
            
            res.json({ message: 'Alert preferences updated successfully', alertPreferences: req.user.alertPreferences });
        });

        // Route to get job alert preferences
        server.get('/get-alert-preferences', isAuthenticated, (req, res) => {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const alertPreferences = req.user.alertPreferences || { enabled: true, skills: [] };
            res.json(alertPreferences);
        });

        // Route to update notification preferences
        server.post('/update-notification-preferences', isAuthenticated, async (req, res) => {
            const notificationPreferences = req.body;
            
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            
            try {
                // Update user's settings in memory
                if (!req.user.settings) {
                    req.user.settings = {};
                }
                
                // Merge in the new notification preferences
                req.user.settings = {
                    ...req.user.settings,
                    ...notificationPreferences
                };
                
                // Update the user in the users array
                const userIndex = users.findIndex(u => u.id === req.user.id);
                if (userIndex !== -1) {
                    users[userIndex].settings = req.user.settings;
                }
                
                // Update in database
                await pool.query(
                    'UPDATE users SET settings = $1 WHERE id = $2',
                    [JSON.stringify(req.user.settings), req.user.id]
                );
                
                res.json({ 
                    message: 'Notification preferences updated successfully', 
                    settings: req.user.settings 
                });
            } catch (error) {
                console.error('Error updating notification preferences:', error);
                res.status(500).json({ error: 'Failed to update notification preferences' });
            }
        });

        // Modify the notification creation logic to respect user preferences
        // Example for a job application notification:
        const createNotification = (userId, message, type) => {
            // Find the user
            const user = users.find(u => u.id === userId);
            if (!user) return null;
            
            // Check if the user has disabled this type of notification
            const notificationTypes = user.settings?.notificationTypes || {};
            const notificationChannels = user.settings?.notificationChannels || {};
            
            // Determine if we should create the notification based on type and channels
            let shouldCreateNotification = true;
            
            switch (type) {
                case 'job-application':
                    shouldCreateNotification = notificationTypes.newApplication !== false;
                    break;
                case 'status-update':
                    shouldCreateNotification = notificationTypes.applicationStatusUpdates !== false;
                    break;
                case 'message':
                    shouldCreateNotification = notificationTypes.messages !== false;
                    break;
                case 'interview-scheduled':
                    shouldCreateNotification = notificationTypes.interviewInvitations !== false;
                    break;
                case 'job-alert':
                    shouldCreateNotification = notificationTypes.newJobMatches !== false;
                    break;
                // Add other notification types as needed
            }
            
            // Check if in-app notifications are enabled
            if (!notificationChannels.inApp) {
                shouldCreateNotification = false;
            }
            
            if (shouldCreateNotification) {
                const notification = new Notification(userId, message, type);
                notifications.push(notification);
                return notification;
            }
            
            return null;
        };

        // Then use this function instead of directly creating notifications
        // For example:
        // const notification = createNotification(
        //    job.client.id,
        //    `New application received for "${job.title}" from ${req.user.username}`,
        //    'job-application'
        // );
        // 
        // if (notification) {
        //     // Insert notification into database
        //     await pool.query(
        //         'INSERT INTO notifications(id, user_id, message, type, is_read, created_at) VALUES($1, $2, $3, $4, $5, $6)',
        //         [
        //             notification.id, notification.userId, notification.message, 
        //             notification.type, notification.isRead, notification.createdAt
        //         ]
        //     );
        // }

        // Forward all other requests to Next.js
        server.all('*', (req, res) => {
            return handle(req, res);
        });

        // Change server.listen to httpServer.listen
        httpServer.listen(3000, (err) => {
            if (err) throw err;
            console.log('> Ready on http://localhost:3000');
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });

// Periodic job cleanup
setInterval(async () => {
    const now = new Date();
    
    console.log('Current time:', now.toISOString());
    // Get expired jobs
    const expiredJobs = jobs.filter((job) => {
        const isExpired = !job.autoRenew && new Date(job.expiryTime) <= now;
        if (isExpired) {
            console.log(`Job ${job.id} expired at ${job.expiryTime}`);
        }
        return isExpired;
    });
    console.log(`Found ${expiredJobs.length} expired jobs.`);

    
    if (expiredJobs.length > 0) {
        try {
            for (const job of expiredJobs) {
                console.log(`Job ${job.id} expired and will be removed.`);
                
                // Remove from database
                await pool.query('DELETE FROM jobs WHERE id = $1', [job.id]);
                
                // Delete related applications from database
                await pool.query('DELETE FROM applications WHERE job_id = $1', [job.id]);
                
                // Update in-memory arrays
                jobs = jobs.filter(j => j.id !== job.id);
                applications = applications.filter(app => app.jobId !== job.id);
            }
        } catch (error) {
            console.error('Error cleaning up expired jobs:', error);
        }
    }
}, 60000); // Run every minute
