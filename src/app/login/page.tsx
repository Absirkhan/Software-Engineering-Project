import Input from '../Components/input';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LoginPage() {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="text-center mb-4">Welcome Back!</h1>
                <form action="/login" method="POST">
                    <div className="mb-3">
                        <Input
                            type="email"
                            placeholder="Email"
                            name="email"
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <Input
                            type="password"
                            placeholder="Password"
                            name="password"
                            className="form-control"
                        />
                    </div>
                    <a href ="/auth/github">
                        <button type="submit" className="btn btn-primary w-100 mb-3">
                            Login
                        </button>
                    </a>

                </form>
                <div className="text-center text-muted mb-3">OR</div>
                <a href="/auth/github">
                <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center">
                    <img
                        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        alt="GitHub Logo"
                        className="me-2"
                        style={{ width: '20px', height: '20px' }}
                    />
                    Login with GitHub
                </button>
                </a>
                <div className="text-center mt-3">
                    <span className="text-muted">Don't have an account? </span>
                    <a href="/register" className="text-primary text-decoration-none">
                        Register here
                    </a>
                </div>
            </div>
        </div>
    );
}
