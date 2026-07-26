import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { getCurrentUser, login } from '../api/auth.api';
import Spinner from '../../../shared/ui/Spinner';
import './LoginPage.css';

const initialForm = {
    email: "",
    password: "",
    rememberDevice: false,
};

function validateForm(form) {
    const errors = {};

    if (!form.email.trim()) {
        errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Enter a valid email address."
    };

    if (!form.password) {
        errors.password = "Password is required.";
    }

    return errors;
};

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value, checked, type } = event.target;

        setForm((current) => ({
            ...current,
            // Use the value stored inside the variable `name`
            [name]: type === "checkbox" ? checked : value 
        }));

        setErrors((current) => ({
            ...current,
            [name]: ''
        }));

        setServerError("");
    };

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateForm(form);

        if (Object.keys(validationErrors).length > 0) {
            // Saves the validation messages into React state 
            setErrors(validationErrors);
            return;
        };

        setIsSubmitting(true);
        setServerError("");

        try {
            await login({
                email: form.email,
                password: form.password
            });

            const currentUser = await getCurrentUser();

            console.log("Authenticated user: ", currentUser.user);

            // Replace this when the calendar scheduling page exists (navigation)
            /**
             *    window.location.assign() performs a full page reload. It also adds the 
             *    current page to browser history -> user can press the Back button
             * 
             *      similar to window.location.href
             */
            // window.location.assign("/schedule-calendar")

            navigate("/schedule-calendar", { replace: true });
        } catch (error) {
            if (error.status === 401) {
                setServerError("The email address or password is incorrect.");
            } else if (error.status === 429) {
                setServerError("Too many login attempts. Please wait 10 minutes before trying again");
            } else {
                setServerError(
                    error.message ||
                    "Unable to sign in. Please try again."
                )
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-portal" aria-labelledby="login-title">
                <header className="login-header">
                    <h1 id="login-title">Welcome Back</h1>
                    <p>Sign in to manage your business</p>
                </header>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {serverError && (
                        <div className="form-alert" role="alert" >{serverError}</div>
                    )}

                    <div className="form-field">
                        <label htmlFor="email">Email Address</label>

                        <input 
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder='name@business.com'
                            autoComplete="email"
                            disabled={isSubmitting}
                        />

                        {errors.email && (
                            <p id="email-error" className="field-error">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <div className="password-label-row">
                            <label htmlFor="password">Password</label>

                            <a 
                                className="forgot-password"
                                href="/forgot-password"
                                onClick={(event) => event.preventDefault()}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        <input 
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            disabled={isSubmitting}
                        />

                        {errors.password && (
                            <p id="password-error" className="field-error">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <label className="remember-device">
                        <input 
                            name="rememberDevice"
                            type="checkbox"
                            checked={form.rememberDevice}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />

                        <span>Remember this device for 30 days</span>
                    </label>

                    <button
                        className="sign-in-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner />
                                Signing in 
                            </>
                        ) : (
                            <>
                                Sign In
                                <span aria-hidden="true">→</span>
                            </>
                        )}
                    </button>
                </form>

                <footer className="login-footer">
                    <p>
                        Don&apos;t have an account?{' '}
                        <a href="/sign-up" onClick={(event) => event.preventDefault()}>
                            Sign Up
                        </a>
                    </p>

                    <nav className="footer-links" aria-label="Legal and support">
                        <a href="/privacy">Privacy Policy</a>
                        <span aria-hidden="true">.</span>
                        <a href="/terms">Terms of Service</a>
                        <span aria-hidden="true">.</span>
                        <a href="/support">Support</a>
                    </nav>
                </footer>
            </section>
        </main>
    )

}
