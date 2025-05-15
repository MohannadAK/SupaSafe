import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ENDPOINTS, apiRequest } from '../config/api';

function AddPassword({ onLogout }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(16);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' // success, error, warning, info
  });

  // Function to show a toast message
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
    
    // Automatically hide the toast after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let generatedPassword = '';
    for (let i = 0; i < passwordLength; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the API to create a new password
      const response = await apiRequest(ENDPOINTS.ADD_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({
          siteName: name,
          username: username,
          password: password,
          websiteUrl: website
        })
      });
      
      // Log detailed response information
      console.log('Add Password Response:', response);
      console.log('Response type:', typeof response);
      if (typeof response === 'object') {
        console.log('Response keys:', Object.keys(response));
      }
      
      // Extract the ID from the response which might be nested
      let passwordId;
      
      if (response && response.password && response.password.id) {
        // If the response has a nested password object with an id
        passwordId = response.password.id;
        console.log('Found ID in response.password.id:', passwordId);
      } else if (response && response.id) {
        // If the response has a direct id property
        passwordId = response.id;
        console.log('Found ID in response.id:', passwordId);
      } else if (response && response.site && response.site.id) {
        // Try another possible structure
        passwordId = response.site.id;
        console.log('Found ID in response.site.id:', passwordId);
      } else {
        // Fallback to a random ID if none is provided
        passwordId = 'temp-' + Date.now();
        console.warn('No ID found in response, using temporary ID:', passwordId);
        console.warn('Full response for debugging:', JSON.stringify(response));
      }
      
      // Show success message as toast instead of alert
      showToast('Password added successfully!', 'success');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Error adding password:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Show error message as toast instead of alert
      showToast('Unable to add password. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toast component styles based on type
  const getToastStyles = () => {
    const baseStyles = 'fixed bottom-4 right-4 px-5 py-3 rounded-md shadow-lg z-50 flex items-center transition-opacity duration-500';
    const typeStyles = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-600 text-white'
    };
    
    return `${baseStyles} ${typeStyles[toast.type]}`;
  };
  
  // Toast icon based on type
  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} title="Add Password" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Password</h2>
            <p className="text-gray-600 mb-6">Store a new password in your secure vault</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gmail, Twitter, Bank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username / Email
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username or email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  id="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-32"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      className="h-full px-2 text-gray-600 hover:text-gray-800"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="h-full px-2 text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="passwordLength" className="block text-sm font-medium text-gray-700">
                    Password Length: {passwordLength}
                  </label>
                </div>
                <input
                  id="passwordLength"
                  type="range"
                  min="8"
                  max="20"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>8</span>
                  <span>14</span>
                  <span>20</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className={getToastStyles()}>
          {getToastIcon()}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            className="ml-4 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default AddPassword; 