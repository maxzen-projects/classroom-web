import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ROUTES } from '../routes';
import Modal from '../components/Modal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const { login, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(ROUTES.SPLASH, { replace: true });
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  const openForgotModal = () => {
    setForgotEmail('');
    setForgotMessage('');
    setForgotError('');
    setForgotOpen(true);
  };

  const closeForgotModal = () => {
    setForgotOpen(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    const result = await forgotPassword(forgotEmail);
    if (result.success) {
      if (result.emailSent) {
        setForgotMessage('Password reset link sent to your email. Check your inbox and spam folder.');
      } else {
        setForgotMessage(`Password reset link generated. Use this link to reset your password: ${result.resetUrl}`);
      }
      // Auto-close after 5 seconds on success
      setTimeout(() => {
        closeForgotModal();
      }, 5000);
    } else {
      setForgotError(result.error);
    }

    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full input-field mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full input-field mb-4"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={openForgotModal}
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot password?
          </button>
          <p className="text-sm">
            Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
          </p>
        </div>
      </form>

      <Modal isOpen={forgotOpen} onClose={closeForgotModal} title="Forgot Password">
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send a link to reset your password.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="w-full input-field"
            required
          />

          {forgotError && (
            <div className="text-red-600 text-sm">{forgotError}</div>
          )}
          {forgotMessage && (
            <div className="text-green-600 text-sm">{forgotMessage}</div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="submit"
              disabled={forgotLoading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={closeForgotModal}
              className="btn-secondary flex-1 border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Login;
