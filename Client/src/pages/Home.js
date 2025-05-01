import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function Home({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = (email, password) => {
    // API INTEGRATION POINT:
    // Replace this with actual API authentication
    // In a real app, you would validate credentials here with a backend call
    console.log('Logging in with:', email, password);
    
    // Store user info in localStorage (in a real app, you'd store a token)
    localStorage.setItem('userEmail', email);
    
    // Call the login handler from App.js
    onLogin();
  };

  const handleRegister = (email, password) => {
    // API INTEGRATION POINT:
    // Replace this with actual API registration
    // In a real app, you would create an account here with a backend call
    console.log('Registering with:', email, password);
    
    // Store user info in localStorage (in a real app, you'd store a token)
    localStorage.setItem('userEmail', email);
    
    // Call the login handler from App.js
    onLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg 
              className="h-12 w-12 text-blue-600" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Secure Password Manager</h1>
          <p className="mt-2 text-gray-600">Your passwords, secured with one master key</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              className={`flex-1 py-4 text-center font-medium transition-all duration-300 ${
                activeTab === 'login' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium transition-all duration-300 ${
                activeTab === 'register' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'login' ? (
              <LoginForm onLogin={handleLogin} />
            ) : (
              <RegisterForm onRegister={handleRegister} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 