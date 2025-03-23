const express = require('express');
const next = require('next');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');




const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

class User {
    constructor(email,username, password ){
        this.email = email;
        this.username = username;
        this.password = password;
        this.projects = [];
    }
}

class Job {
    constructor(title, description, type, location, qualifications, experience, skills, salaryRange, benefits, applicationDeadline, autoRenew,client) {
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
    }
}

let users = [];
let jobs = [];

// Configure GitHub OAuth strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: 'Ov23liu6WE4ObN5pnYJE',
            clientSecret: '5f69b0f0c2c7d5a2b55e2ecf9382c2570b84ce5c',
            callbackURL: 'http://localhost:3000/auth/github/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            profile.accessToken = accessToken; // Store access token
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.prepare().then(() => {
    currentUser = null;
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

    // GitHub Authentication Routes
    server.get('/auth/github', passport.authenticate('github', { scope: ['repo', 'read:org'] }));

    server.post('/createjob', (req, res) => {
        console.log(req.body);
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
            currentUser
        );
        jobs.push(job);
        res.status(201).json({ message: 'Job created successfully', job });
    });
    
    server.get('/get-jobs', (req, res) => {
        res.json(jobs);
    });

    server.get(
        '/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/login' }),
        async (req, res) => {
            if (!req.user || !req.user.accessToken) {
                console.error('Authentication failed: Missing access token');
                return res.redirect('/login');
            }
    
            const accessToken = req.user.accessToken;
    
            try {
                // Fetch GitHub user data
                const userResponse = await axios.get('https://api.github.com/user', {
                    headers: { Authorization: `token ${accessToken}` },
                });
    
                const email = userResponse.data.avatar_url; // May need additional API call for email
                const username = userResponse.data.login;
    
                if (!email || !username) {
                    console.warn('GitHub user data is incomplete:', userResponse.data);
                    return res.redirect('/login');
                }
    
                // Find or create the user
                let user = users.find(u => u.email === email);
    
                if (!user) {
                    user = new User(email, username, 'github'); // Ensure this constructor handles 'github' properly
                    users.push(user);
                }
    
                currentUser = user;
    
                // Fetch user's GitHub repositories
                try {
                    const reposResponse = await axios.get('https://api.github.com/user/repos', {
                        headers: { Authorization: `token ${accessToken}` },
                    });
                    currentUser.projects = reposResponse.data; // Save projects to the user object
                } catch (repoError) {
                    console.error('Error fetching GitHub repos:', repoError.response?.data || repoError.message);
                    currentUser.projects = []; // Assign an empty array if fetching fails
                }
            } catch (error) {
                console.error('Error fetching user data from GitHub API:', error.response?.data || error.message);
                return res.redirect('/login');
            }
    
            // Redirect to the client dashboard
            res.redirect('/client_dashboard');
        }
    );
    
    

    // Logout Route
    server.get('/auth/logout', (req, res) => {
        req.logout((err) => {
            if (err) {
                console.error('Logout Error', err);
            }
            res.redirect('/');
        });
    });


    server.post('/register', (req, res) => {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        const username = req.body.username
        if(users.find(user => user.email === email)) {
            return res.redirect('/register');
        }
        const user = new User(email,username, password);
        users.push(user);
        return res.redirect('/login');
    });
        

    // Login Route

    server.get('/get-user', (req, res) => {
        console.log(currentUser);
        res.json(currentUser);
    });


    server.post('/login', (req, res) => {

            currentUser = users.find(user => user.email === req.body.email && user.password === req.body.password);
            if(currentUser) {
                return res.redirect('/client_dashboard');
            }
        
        res.redirect('/login');
    });


    // Handle all other requests with Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
