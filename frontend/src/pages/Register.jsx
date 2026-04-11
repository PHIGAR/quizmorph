import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="card-container w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Create an account</h2>
          <p className="text-slate-500 mt-2">Join QuizMorph to build your quizzes</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required 
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
