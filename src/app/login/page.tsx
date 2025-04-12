import Input from '../Components/input';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LoginPage() {
    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                background: 'linear-gradient(135deg, #e6f0ff, #f0e6ff)',
                fontFamily: "'Poppins', sans-serif",
            }}
        >
            <div
                className="card p-4 shadow-sm"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#ffffff',
                }}
            >
                <h1
                    className="text-center mb-4"
                    style={{ color: '#5d5d5d' }}
                >
                    Welcome Back!
                </h1>
                <form action="/login" method="POST">
                    <div className="mb-3">
                        <Input
                            type="email"
                            placeholder="Email"
                            name="email"
                            className="form-control"
                            style={{ borderRadius: '6px' }}
                        />
                    </div>
                    <div className="mb-3">
                        <Input
                            type="password"
                            placeholder="Password"
                            name="password"
                            className="form-control"
                            style={{ borderRadius: '6px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 mb-3"
                        style={{
                            backgroundColor: '#a8c6fa',
                            color: '#4a4a4a',
                            borderRadius: '6px',
                            border: 'none',
                        }}
                    >
                        Login
                    </button>
                </form>
                <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted small">OR</span>
                    <hr className="flex-grow-1" />
                </div>
                <a href="/auth/github" className="text-decoration-none">
                    <button
                        className="btn w-100 d-flex align-items-center justify-content-center"
                        style={{
                            backgroundColor: '#e8e8e8',
                            color: '#333333',
                            borderRadius: '6px',
                            border: 'none',
                        }}
                    >
                        <img
                            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                            alt="GitHub Logo"
                            className="me-2"
                            style={{ width: '18px', height: '18px' }}
                        />
                        Login with GitHub
                    </button>
                </a>
                <div className="text-center mt-3">
                    <span className="text-muted small">Don't have an account? </span>
                    <a
                        href="/register"
                        className="text-decoration-none"
                        style={{ color: '#a8c6fa' }}
                    >
                        Register here
                    </a>
                </div>
            </div>
        </div>
    );
}
