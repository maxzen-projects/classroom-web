import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(name, email, phone, password, role);
      if (result.success) {
        alert(result.message);
        navigate('/login');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full input-field mb-4"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full input-field mb-4"
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full input-field mb-4"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-2 rounded">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;