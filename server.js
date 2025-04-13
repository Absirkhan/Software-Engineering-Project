const express = require('express');
const next = require('next');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

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
    constructor(title, description, type, location, qualifications, experience, skills, salaryRange, benefits, applicationDeadline, autoRenew, client) {
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
        this.applicationDeadline = applicationDeadline;
        this.autoRenew = autoRenew;
        this.client = client;
        this.createdAt = new Date().toISOString();
        this.applications = [];
        this.status = 'active'; // active, closed, filled
    }
}

class JobApplication {
    constructor(jobId, freelancer, coverLetter, resume) {
        this.id = uuidv4();
        this.jobId = jobId;
        this.freelancer = freelancer;
        this.coverLetter = coverLetter;
        this.resume = resume;
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

let users = [];
let jobs = [];
let applications = [];
let notifications = [];

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

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.prepare().then(() => {
    let currentUser = null;
    const server = express();

    server.use(
        session({
            secret: 'secretKey', // Replace with a strong secret key
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
        })
    );

    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(express.json());

    // Authentication middleware
    const isAuthenticated = (req, res, next) => {
        if (currentUser) {
            return next();
        }
        res.status(401).json({ error: 'Unauthorized' });
    };

    // GitHub Authentication Routes
    server.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

    server.get('/auth/github/callback', 
        passport.authenticate('github', { failureRedirect: '/login' }),
        (req, res) => {
            // Set the current user
            currentUser = req.user;
            
            // Redirect based on user role
            if (currentUser.role === 'freelancer') {
                res.redirect('/freelancer_dashboard');
            } else {
                res.redirect('/client_dashboard');
            }
        }
    );
    
    // Add an endpoint to get GitHub repositories for the profile
    server.get('/get-github-repositories', isAuthenticated, (req, res) => {
        if (currentUser && currentUser.githubRepositories) {
            res.json({
                repositories: currentUser.githubRepositories,
                username: currentUser.username
            });
        } else {
            res.json({ repositories: [], username: currentUser?.username });
        }
    });
    
    // Add ability to refresh GitHub repositories
    server.post('/refresh-github-repositories', isAuthenticated, async (req, res) => {
        if (!currentUser || !currentUser.githubToken) {
            return res.status(401).json({ error: 'GitHub credentials not found' });
        }
        
        try {
            const reposResponse = await axios.get('https://api.github.com/user/repos', {
                headers: {
                    'Authorization': `token ${currentUser.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                params: {
                    sort: 'updated',
                    per_page: 100
                }
            });
            
            if (reposResponse.status === 200) {
                // Update repositories for current user
                currentUser.githubRepositories = reposResponse.data.map(repo => ({
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
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].githubRepositories = currentUser.githubRepositories;
                }
                
                res.json({ 
                    message: 'GitHub repositories refreshed',
                    count: currentUser.githubRepositories.length,
                    repositories: currentUser.githubRepositories
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
        currentUser = user;
        return res.json({ message: 'Registration successful', user });
    });

    // User routes
    server.get('/get-user', (req, res) => {
        if (currentUser) {
            res.json(currentUser);
        } else {
            res.status(401).json({ error: 'Not logged in' });
        }
    });

    server.post('/login', (req, res) => {
        currentUser = users.find(user => user.email === req.body.email && user.password === req.body.password);
        if (currentUser) {
            res.json({ message: 'Login successful', user: currentUser });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });

    server.get('/auth/logout', (req, res) => {
        currentUser = null;
        req.logout((err) => {
            if (err) {
                console.error('Logout Error', err);
            }
            res.json({ message: 'Logged out successfully' });
        });
    });

    // Profile routes
    server.post('/update-profile', isAuthenticated, (req, res) => {
        const profileData = req.body;
        if (currentUser) {
            currentUser.profile = { ...currentUser.profile, ...profileData };
            
            // Update the user in the users array
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].profile = currentUser.profile;
            }
            
            res.json({ message: 'Profile updated successfully', profile: currentUser.profile });
        } else {
            res.status(401).json({ error: 'User not authenticated' });
        }
    });

    server.get('/get-profile', isAuthenticated, (req, res) => {
        if (currentUser) {
            res.json(currentUser.profile);
        } else {
            res.status(401).json({ error: 'User not authenticated' });
        }
    });

    // Job routes
    server.post('/createjob', isAuthenticated, (req, res) => {
        console.log(req.body);
        if (currentUser && currentUser.role === 'client') {
            const job = new Job(
                req.body.title,
                req.body.description,
                req.body.type,
                req.body.location,
                req.body.qualifications,
                req.body.experience,
                req.body.skills,
                req.body.salaryRange,
                req.body.benefits,
                req.body.applicationDeadline,
                req.body.autoRenew,
                {
                    id: currentUser.id,
                    username: currentUser.username,
                    email: currentUser.email
                }
            );
            jobs.push(job);
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
        const jobIndex = jobs.findIndex(j => j.id === jobId && j.client.id === currentUser.id);
        
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
        const jobIndex = jobs.findIndex(j => j.id === jobId && j.client.id === currentUser.id);
        
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
        const jobId = req.params.id;
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        if (currentUser.role !== 'freelancer') {
            return res.status(403).json({ error: 'Only freelancers can apply for jobs' });
        }
        
        // Check if already applied
        const existingApplication = applications.find(
            app => app.jobId === jobId && app.freelancer.id === currentUser.id
        );
        
        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        
        const application = new JobApplication(
            jobId,
            {
                id: currentUser.id,
                username: currentUser.username,
                email: currentUser.email
            },
            req.body.coverLetter,
            req.body.resume
        );
        
        applications.push(application);
        job.applications.push(application.id);
        
        // Create notification for the job owner
        const notification = new Notification(
            job.client.id,
            `New application received for "${job.title}" from ${currentUser.username}`,
            'job-application'
        );
        notifications.push(notification);
        
        res.status(201).json({ message: 'Application submitted successfully', application });
    });

    server.get('/get-applications', isAuthenticated, (req, res) => {
        if (currentUser.role === 'client') {
            // Get all applications for jobs posted by this client
            const clientJobs = jobs.filter(job => job.client.id === currentUser.id);
            const jobIds = clientJobs.map(job => job.id);
            const jobApplications = applications.filter(app => jobIds.includes(app.jobId));
            
            // Add job title to each application for easier frontend display
            const enrichedApplications = jobApplications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return {
                    ...app,
                    jobTitle: job ? job.title : 'Unknown Job'
                };
            });
            
            res.json(enrichedApplications);
        } else if (currentUser.role === 'freelancer') {
            // Get all applications submitted by this freelancer
            const userApplications = applications.filter(app => app.freelancer.id === currentUser.id);
            
            // Add job title to each application
            const enrichedApplications = userApplications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return {
                    ...app,
                    jobTitle: job ? job.title : 'Unknown Job',
                    client: job ? job.client : null
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
        
        if (!job || job.client.id !== currentUser.id) {
            return res.status(403).json({ error: 'Job not found or you do not have permission to view these applications' });
        }
        
        const jobApplications = applications.filter(app => app.jobId === jobId);
        res.json(jobApplications);
    });

    server.post('/update-application-status/:id', isAuthenticated, (req, res) => {
        const applicationId = req.params.id;
        const { status } = req.body;
        
        const applicationIndex = applications.findIndex(a => a.id === applicationId);
        if (applicationIndex === -1) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        const application = applications[applicationIndex];
        const job = jobs.find(j => j.id === application.jobId);
        
        if (!job || job.client.id !== currentUser.id) {
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
        
        res.json({ message: 'Application status updated', application });
    });

    // Notification routes
    server.get('/get-notifications', isAuthenticated, (req, res) => {
        const userNotifications = notifications.filter(n => n.userId === currentUser.id);
        res.json(userNotifications);
    });

    server.post('/mark-notification-read/:id', isAuthenticated, (req, res) => {
        const notificationId = req.params.id;
        const notificationIndex = notifications.findIndex(
            n => n.id === notificationId && n.userId === currentUser.id
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
            if (notification.userId === currentUser.id && !notification.isRead) {
                notifications[index].isRead = true;
                count++;
            }
        });
        
        res.json({ message: `${count} notifications marked as read` });
    });

    // Forward all other requests to Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
