import React, { useState, useEffect, useRef } from 'react';
import AddPasswordModal from '../components/AddPasswordModal';
import EditPasswordModal from '../components/EditPasswordModal';
import Header from '../components/Header';
import { ENDPOINTS } from '../config/api';
import { apiRequest } from '../config/api';



function Dashboard({ onLogout }) {
  const [passwords, setPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Create a map of refs for each dropdown menu
  const dropdownRefs = useRef({});

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest(ENDPOINTS.PASSWORDS);
        
        if (response && response.sites) {
          // Transform the site data to match the expected password format
          const formattedSites = response.sites.map(site => ({
            id: site.id,
            name: site.siteName,
            username: site.username,
            website: site.websiteUrl,
            // You'll need to handle actual password data differently since it's not in the response
            password: '••••••••••', // Placeholder
            created: new Date(site.creationDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            updated: new Date(site.lastUpdate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          }));
          
          setPasswords(formattedSites);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        // Fallback to localStorage if API call fails
        const savedPasswords = localStorage.getItem('passwords');
        if (savedPasswords) {
          setPasswords(JSON.parse(savedPasswords));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSites();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        const currentRef = dropdownRefs.current[activeDropdown];
        if (currentRef && !currentRef.contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Save passwords to localStorage whenever they change
  useEffect(() => {
    if (passwords.length > 0) {
      localStorage.setItem('passwords', JSON.stringify(passwords));
    }
  }, [passwords]);

  const filteredPasswords = passwords.filter(
    (password) =>
      password.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.website.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddPassword = async (newPassword) => {
    try {
      // Call the API to create a new password
      const response = await apiRequest(ENDPOINTS.ADD_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({
          siteName: newPassword.name,
          username: newPassword.username,
          password: newPassword.password,
          websiteUrl: newPassword.website
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
      
      // After successful API call, update local state with the new data
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Format the password for display in the UI - only store metadata, not the actual password
      const formattedPassword = {
        id: passwordId,
        name: newPassword.name,
        username: newPassword.username,
        password: '••••••••••', // Use placeholder instead of actual password
        website: newPassword.website,
        created: today,
        updated: today,
      };
      
      console.log('Adding formatted password to state:', formattedPassword);
      setPasswords([...passwords, formattedPassword]);
      setShowAddModal(false);
      
      // Show success message
      showToast('Password added successfully!', 'success');
      
    } catch (error) {
      console.error('Error adding password:', error);
      console.error('Error details:', error.message, error.stack);
      showToast('Unable to add password', 'error');
    }
  };

  const handleEditPassword = async (updatedPassword) => {
    try {
      await apiRequest(ENDPOINTS.UPDATE_PASSWORD(updatedPassword.id), {
        method: 'PUT',
        body: JSON.stringify({
          siteName: updatedPassword.name,
          username: updatedPassword.username,
          password: updatedPassword.password,
          websiteUrl: updatedPassword.website
        })
      });
      
      // After successful API call, update local state
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Update the password item but keep the password placeholder
      // This ensures we don't expose the actual password in the UI
      setPasswords(
        passwords.map((password) =>
          password.id === updatedPassword.id
            ? {
                ...updatedPassword,
                password: '••••••••••', // Reset to placeholder
                updated: today,
              }
            : password,
        ),
      );
      
      // Reset visibility of the password
      setVisiblePasswords({
        ...visiblePasswords,
        [updatedPassword.id]: false,
      });
      
      setShowEditModal(false);
      setActiveDropdown(null);
      
      // Show success message
      showToast('Password updated successfully', 'success');
    } catch (error) {
      console.error('Error updating password:', error);
      showToast('Unable to update password', 'error');
    }
  };

  const handleDeletePassword = async (id) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      try {
        // Call the API to delete the password
        await apiRequest(ENDPOINTS.DELETE_PASSWORD(id), {
          method: 'DELETE'
        });
        
        // After successful API call, update local state
        setPasswords(passwords.filter((password) => password.id !== id));
        setActiveDropdown(null);
        
        // Show success message
        showToast('Password deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting password:', error);
        showToast('Unable to delete password', 'error');
      }
    }
  };

  // Add a direct getPasswordById function for testing and debugging
  const getPasswordById = async (id) => {
    try {
      // Log diagnostic information
      console.log('getPasswordById called with id:', id);
      
      // Build the endpoint
      const endpoint = ENDPOINTS.GET_PASSWORD(id);
      console.log('Generated endpoint:', endpoint);
      
      // Log the full URL that will be used
      const fullUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'}${endpoint}`;
      console.log('Full URL for API call:', fullUrl);
      
      // Make the request
      const response = await apiRequest(endpoint);
      console.log('API response for getPasswordById:', response);
      
      return response;
    } catch (error) {
      console.error('Error in getPasswordById:', error);
      throw error;
    }
  };

  const togglePasswordVisibility = async (id) => {
    // If password is already visible, just toggle it off
    if (visiblePasswords[id]) {
      setVisiblePasswords({
        ...visiblePasswords,
        [id]: false,
      });
      return;
    }
    
    // Check if this is a temporary ID (which won't work with the API)
    if (typeof id === 'string' && id.startsWith('temp-')) {
      showToast('This password was just added. Please refresh the page first.', 'warning');
      return;
    }
    
    // If password is not visible and not loaded yet, fetch it
    try {
      // Find the password in the list to check if it has a real password
      const passwordItem = passwords.find(p => p.id === id);
      if (!passwordItem) {
        console.error('Password not found with id:', id);
        showToast('Could not find password', 'error');
        return;
      }
      
      console.log('Attempting to view password with ID:', id);
      
      // If we have just a placeholder password (stars), fetch the real one
      if (passwordItem.password === '••••••••••') {
        // Show loading state
        setPasswords(
          passwords.map((p) =>
            p.id === id
              ? { ...p, password: 'loading' } // special 'loading' flag
              : p
          )
        );
        
        try {
          // Use our direct function to get the password
          const response = await getPasswordById(id);
          
          // Extract the password from the nested structure
          let passwordValue = '';
          
          // Handle different response structures
          if (response && response.password && response.password.password) {
            passwordValue = response.password.password;
            console.log('Found password in response.password.password');
          } else if (response && response.password && typeof response.password === 'string') {
            passwordValue = response.password;
            console.log('Found password in response.password as string');
          } else if (response && typeof response === 'string') {
            passwordValue = response;
            console.log('Response is a direct string');
          }
          
          if (!passwordValue) {
            console.warn('No password value found in response:', response);
            passwordValue = 'Password not available';
          }
          
          // Update the password in the list with the actual password
          setPasswords(
            passwords.map((p) =>
              p.id === id
                ? { ...p, password: passwordValue }
                : p
            )
          );
          
          // Set the password as visible
          setVisiblePasswords({
            ...visiblePasswords,
            [id]: true,
          });
        } catch (error) {
          console.error('Error fetching password:', error);
          console.error('Error details:', error.message, error.stack);
          
          // Reset to placeholder if there was an error
          setPasswords(
            passwords.map((p) =>
              p.id === id
                ? { ...p, password: '••••••••••' }
                : p
            )
          );
          
          showToast('Unable to fetch password', 'error');
        }
      } else {
        // Password is already loaded, just make it visible
        setVisiblePasswords({
          ...visiblePasswords,
          [id]: true,
        });
      }
    } catch (error) {
      console.error('Unexpected error in togglePasswordVisibility:', error);
      console.error('Error details:', error.message, error.stack);
      showToast('An unexpected error occurred', 'error');
    }
  };

  const toggleDropdown = (id, e) => {
    // Stop event propagation to prevent immediate closing
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Use toast notification instead of creating a custom element
        showToast(`${type} copied to clipboard!`, 'success');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        showToast(`Failed to copy ${type.toLowerCase()}`, 'error');
      }
    );
  };

  // Function to handle copying password from the dropdown menu
  const handleCopyPassword = async (password) => {
    try {
      // Check if this is a temporary ID (which won't work with the API)
      if (typeof password.id === 'string' && password.id.startsWith('temp-')) {
        showToast('This password was just added. Please refresh the page first.', 'warning');
        return;
      }
      
      // If the password is just a placeholder, fetch the real one first
      if (password.password === '••••••••••') {
        try {
          const response = await getPasswordById(password.id);
          
          // Extract the password from the nested structure
          let passwordValue = '';
          
          // Handle different response structures
          if (response && response.password && response.password.password) {
            passwordValue = response.password.password;
          } else if (response && response.password && typeof response.password === 'string') {
            passwordValue = response.password;
          } else if (response && typeof response === 'string') {
            passwordValue = response;
          }
          
          if (!passwordValue) {
            console.warn('No password value found in response for copy:', response);
            showToast('Password data not available', 'error');
            return;
          }
          
          copyToClipboard(passwordValue, 'Password');
        } catch (error) {
          console.error('Error fetching password for copying:', error);
          showToast('Unable to copy password', 'error');
        }
      } else {
        // Password already loaded, just copy it
        copyToClipboard(password.password, 'Password');
      }
    } catch (error) {
      console.error('Unexpected error in handleCopyPassword:', error);
      console.error('Error details:', error.message, error.stack);
      showToast('An unexpected error occurred', 'error');
    }
  };

  // Function to fetch the password before opening the edit modal
  const handleEditButtonClick = async (password) => {
    try {
      // Check if this is a temporary ID (which won't work with the API)
      if (typeof password.id === 'string' && password.id.startsWith('temp-')) {
        showToast('This password was just added. Please refresh the page first.', 'warning');
        return;
      }
      
      // If the password is just a placeholder, fetch the real one from the API
      if (password.password === '••••••••••') {
        // Show loading state
        setCurrentPassword({...password, password: 'Loading...'});
        setShowEditModal(true);
        
        try {
          // Use our direct function to get the password
          const response = await getPasswordById(password.id);
          
          // Extract the password from the nested structure
          let passwordValue = '';
          
          // Handle different response structures
          if (response && response.password && response.password.password) {
            passwordValue = response.password.password;
          } else if (response && response.password && typeof response.password === 'string') {
            passwordValue = response.password;
          } else if (response && typeof response === 'string') {
            passwordValue = response;
          }
          
          if (!passwordValue) {
            console.warn('No password value found in response for edit:', response);
            passwordValue = 'Password not available';
          }
          
          // Update the current password with the actual password
          setCurrentPassword({...password, password: passwordValue});
        } catch (error) {
          console.error('Error fetching password for editing:', error);
          console.error('Error details:', error.message, error.stack);
          // Close the modal and show error
          setShowEditModal(false);
          showToast('Unable to fetch password for editing', 'error');
        }
      } else {
        // Password already loaded, just show the modal
        setCurrentPassword(password);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Unexpected error in handleEditButtonClick:', error);
      console.error('Error details:', error.message, error.stack);
      setShowEditModal(false);
      showToast('An unexpected error occurred', 'error');
    }
  };

  // Function to refresh the password list from the API
  const refreshPasswordList = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(ENDPOINTS.PASSWORDS);
      
      if (response && response.sites) {
        // Transform the site data to match the expected password format
        const formattedSites = response.sites.map(site => ({
          id: site.id,
          name: site.siteName,
          username: site.username,
          website: site.websiteUrl,
          password: '••••••••••', // Placeholder
          created: new Date(site.creationDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          updated: new Date(site.lastUpdate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        }));
        
        setPasswords(formattedSites);
        // Clear visibility states for all passwords
        setVisiblePasswords({});
        showToast('Password list refreshed', 'success');
      }
    } catch (error) {
      console.error('Error refreshing password list:', error);
      showToast('Failed to refresh password list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} title="Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold">Your Passwords</h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={refreshPasswordList}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              <svg 
                className={`h-5 w-5 mr-1 ${isLoading ? 'animate-spin' : ''}`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg 
                className="h-5 w-5 mr-1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Password
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {isLoading ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">No passwords found. Add your first password to get started.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg">
            <div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPasswords.map((password) => (
                    <tr key={password.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{password.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center group">
                          <span className="truncate max-w-[150px]">{password.username}</span>
                          <button
                            onClick={() => copyToClipboard(password.username, 'Username')}
                            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{password.website}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {password.password === 'loading' ? (
                            <div className="flex items-center">
                              <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Loading...</span>
                            </div>
                          ) : (
                            <span className="font-mono">{visiblePasswords[password.id] ? password.password : '••••••••••'}</span>
                          )}
                          <button
                            onClick={() => togglePasswordVisibility(password.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {visiblePasswords[password.id] ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                          {visiblePasswords[password.id] && password.password !== 'loading' && (
                            <button
                              onClick={() => handleCopyPassword(password)}
                              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                              title="Copy to clipboard"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{password.updated}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div 
                          className="relative inline-block text-left" 
                          ref={(el) => dropdownRefs.current[password.id] = el}
                        >
                          <button
                            onClick={(e) => toggleDropdown(password.id, e)}
                            className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                          {activeDropdown === password.id && (
                            <div 
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditButtonClick(password)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCopyPassword(password)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                  </svg>
                                  Copy Password
                                </button>
                                <button
                                  onClick={() => handleDeletePassword(password.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showAddModal && <AddPasswordModal onClose={() => setShowAddModal(false)} onSave={handleAddPassword} />}

      {showEditModal && currentPassword && (
        <EditPasswordModal
          password={currentPassword}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditPassword}
        />
      )}
      
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

export default Dashboard;