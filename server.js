const express = require('express');
const next = require('next');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

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

let users = [];
let jobs = [];
let applications = [];
let notifications = [];
let interviews = [];

// Add arrays to store the data
let savedJobs = [];
let ratings = [];
let chatMessages = [];

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
                // Check if user exists
                let user = users.find(user => user.username === profile.username);
                
                // If not, create a new user
                if (!user) {
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
                    
                    users.push(user);
                } else {
                    // Update existing user with GitHub data
                    user.githubId = profile.id;
                    user.githubToken = accessToken;
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
                        user.githubRepositories = reposResponse.data.map(repo => ({
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

// Fix serialization/deserialization - this is critical for sessions to work properly
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(user => user.id === id);
    done(null, user || false);
});

app.prepare().then(() => {
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
            name: 'job_portal_session',  // Unique name for the session cookie
            secret: 'secretKey',         // Replace with a strong secret key in production
            resave: false,
            saveUninitialized: false,
            cookie: { 
                maxAge: 24 * 60 * 60 * 1000,  // 1 day
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
                req.user.githubRepositories = reposResponse.data.map(repo => ({
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
                
                // Update the user in the users array
                const userIndex = users.findIndex(u => u.id === req.user.id);
                if (userIndex !== -1) {
                    users[userIndex].githubRepositories = req.user.githubRepositories;
                }
                
                res.json({ 
                    message: 'GitHub repositories refreshed',
                    count: req.user.githubRepositories.length,
                    repositories: req.user.githubRepositories
                });
            } else {
                res.status(500).json({ error: 'Failed to fetch repositories' });
            }
        } catch (error) {
            console.error('Error refreshing GitHub repositories:', error.message);
            res.status(500).json({ error: 'Error retrieving GitHub repositories' });
        }
    });

    // Add this route to check GitHub login status
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

    server.post('/register', (req, res) => {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        const username = req.body.username;
        const role = req.body.role || 'freelancer';
        
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const user = new User(email, username, password, role);
        users.push(user);
        
        // Log the user in after registration
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed after registration' });
            }
            return res.json({ message: 'Registration successful', user });
        });
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
    server.post('/update-profile', isAuthenticated, (req, res) => {
        const profileData = req.body;
        if (req.user) {
            req.user.profile = { ...req.user.profile, ...profileData };
            
            // Update the user in the users array
            const userIndex = users.findIndex(u => u.id === req.user.id);
            if (userIndex !== -1) {
                users[userIndex].profile = req.user.profile;
            }
            
            res.json({ message: 'Profile updated successfully', profile: req.user.profile });
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
    server.post('/createjob', isAuthenticated, (req, res) => {
        console.log(req.body);
        if (req.user && req.user.role === 'client') {
            const job = new Job(
                req.body.title,
                req.body.description,
                req.body.type,
                req.body.location,
                req.body.qualifications,
                req.body.experience,
                req.body.skills || [], // Ensure skills is an array
                req.body.salaryRange,
                req.body.benefits,
                req.body.timerDuration, // Pass timer duration
                req.body.autoRenew,
                {
                    id: req.user.id,
                    username: req.user.username,
                    email: req.user.email
                }
            );
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
            usersToNotify.forEach(({ user, matchingSkills }) => {
                const notification = new Notification(
                    user.id,
                    `A new job "${job.title}" matches your skills (${matchingSkills.join(', ')})`,
                    'job-alert'
                );
                
                notifications.push(notification);
                console.log("go");

                // Send real-time notification via WebSocket
                io.to(user.id).emit('job_alert', { 
                    message: notification.message,
                    jobId: job.id,
                    jobTitle: job.title
                });
            });

            res.status(201).json({ message: 'Job created successfully', job });
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

    server.post('/update-job/:id', isAuthenticated, (req, res) => {
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
            res.json({ message: 'Job updated successfully', job: updatedJob });
        } else {
            res.status(404).json({ error: 'Job not found or you do not have permission to edit it' });
        }
    });

    server.delete('/delete-job/:id', isAuthenticated, (req, res) => {
        const jobId = req.params.id;
        const jobIndex = jobs.findIndex(j => j.id === jobId && j.client.id === req.user.id);
        
        if (jobIndex !== -1) {
            const deletedJob = jobs.splice(jobIndex, 1)[0];
            // Also remove related applications
            applications = applications.filter(app => app.jobId !== jobId);
            res.json({ message: 'Job deleted successfully', job: deletedJob });
        } else {
            res.status(404).json({ error: 'Job not found or you do not have permission to delete it' });
        }
    });

    // Application routes
    server.post('/apply-job/:id', isAuthenticated, (req, res) => {
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
                
                // Create notification for the job owner
                const notification = new Notification(
                    job.client.id,
                    `New application received for "${job.title}" from ${req.user.username}`,
                    'job-application'
                );
                notifications.push(notification);
                
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

    server.post('/update-application-status/:id', isAuthenticated, (req, res) => {
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
        
        // Create notification for the freelancer
        const notification = new Notification(
            application.freelancer.id,
            `Your application for "${job.title}" has been ${status}`,
            'status-update'
        );
        notifications.push(notification);
        
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
        }
        
        res.json({ message: 'Application status updated', application });
    });

    // Interview routes
    server.post('/schedule-interview/:applicationId', isAuthenticated, (req, res) => {
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
            
            notificationMessage = `Interview scheduled for "${job.title}" on ${new Date(dateTime).toLocaleString()}. ${message || ''}`;
            
            // Create a system message about the interview
            const interviewChatMsg = new ChatMessage(
                job.client.id,
                application.freelancer.id,
                `I've scheduled an interview for "${job.title}" on ${new Date(dateTime).toLocaleString()}. ${message ? `Additional info: ${message}` : ''}`,
                false
            );
            chatMessages.push(interviewChatMsg);
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
                    `Thank you for accepting my application for "${job.title}". I'm looking forward to the interview.`,
                    false
                );
                
                chatMessages.push(clientToFreelancerMsg);
                chatMessages.push(freelancerToClientMsg);
            }
        }
        
        const notification = new Notification(
            application.freelancer.id,
            notificationMessage,
            'interview-scheduled'
        );
        notifications.push(notification);
        
        // Also create a chat notification
        const chatNotification = new Notification(
            application.freelancer.id,
            `You have a new message from ${job.client.username} regarding "${job.title}"`,
            'message'
        );
        notifications.push(chatNotification);
        
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

    server.post('/mark-notification-read/:id', isAuthenticated, (req, res) => {
        const notificationId = req.params.id; 
        const notificationIndex = notifications.findIndex(
            n => n.id === notificationId && n.userId === req.user.id
        );
        
        if (notificationIndex !== -1) {
            notifications[notificationIndex].isRead = true;
            res.json({ message: 'Notification marked as read', notification: notifications[notificationIndex] });
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    });

    server.post('/mark-all-notifications-read', isAuthenticated, (req, res) => {
        let count = 0;
        notifications.forEach((notification, index) => {
            if (notification.userId === req.user.id && !notification.isRead) {
                notifications[index].isRead = true;
                count++;
            }
        });
        
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
    server.post('/save-job/:id', isAuthenticated, (req, res) => {
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
        
        res.status(201).json({ message: 'Job saved successfully', savedJob });
    });

    server.delete('/unsave-job/:id', isAuthenticated, (req, res) => {
        const jobId = req.params.id;
        const userId = req.user.id;
        
        const index = savedJobs.findIndex(sj => sj.jobId === jobId && sj.userId === userId);
        if (index === -1) {
            return res.status(404).json({ error: 'Saved job not found' });
        }
        
        const removedJob = savedJobs.splice(index, 1)[0];
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
    server.post('/rate-client/:clientId', isAuthenticated, (req, res) => {
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
        
        // Create notification for the client
        const notification = new Notification(
            clientId,
            `You have received a ${stars}-star rating from ${req.user.username}`,
            'rating'
        );
        notifications.push(notification);
        
        res.status(201).json({ message: 'Rating submitted successfully', rating });
    });

    server.get('/client-ratings/:clientId', (req, res) => {
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
    server.post('/api/chat/read/:userId', isAuthenticated, (req, res) => {
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

        // Handle new messages
        socket.on('send_message', (data) => {
            if (!userId) return;
            
            const { receiverId, content } = data;
            if (!receiverId || !content) return;
            
            const message = new ChatMessage(userId, receiverId, content);
            chatMessages.push(message);
            
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
    server.post('/increment-apply-clicks/:id', (req, res) => {
        const jobId = req.params.id;
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        job.applyClicks += 1; // Increment the applyClicks count
        res.json({ message: 'Apply clicks incremented', applyClicks: job.applyClicks });
    });

    // Route to update job alert preferences
    server.post('/update-alert-preferences', isAuthenticated, (req, res) => {
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

    // Forward all other requests to Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Change server.listen to httpServer.listen
    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});

// Periodic job cleanup
setInterval(() => {
    const now = new Date();
    jobs = jobs.filter(job => {
        if (job.autoRenew) return true; // Skip auto-renew jobs
        if (new Date(job.expiryTime) > now) return true; // Skip non-expired jobs

        // Remove expired job
        console.log(`Job ${job.id} expired and removed.`);
        applications = applications.filter(app => app.jobId !== job.id); // Remove related applications
        return false;
    });
}, 60000); // Run every minute
