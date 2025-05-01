import React, { useState, useEffect } from 'react';
import api from '../config/api';

// This is an example component demonstrating how to use the API integration
function ApiIntegrationExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Example of fetching data with API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Using the helper function from api.js
        const result = await api.getPasswords();
        setData(result.passwords);
      } catch (error) {
        setError(error.message || 'An error occurred');
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Example of creating a new password
  const handleCreatePassword = async (newPasswordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.createPassword(newPasswordData);
      // Update state with the new password
      setData(prevData => [...prevData, result.password]);
      return true; // Indicate success
    } catch (error) {
      setError(error.message || 'Failed to create password');
      console.error('Create password error:', error);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };
  
  // Example of updating a password
  const handleUpdatePassword = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.updatePassword(id, updatedData);
      
      // Update state with the updated password
      setData(prevData => 
        prevData.map(item => 
          item.id === id ? result.password : item
        )
      );
      
      return true; // Indicate success
    } catch (error) {
      setError(error.message || 'Failed to update password');
      console.error('Update password error:', error);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };
  
  // Example of deleting a password
  const handleDeletePassword = async (id) => {
    if (!window.confirm('Are you sure you want to delete this password?')) {
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.deletePassword(id);
      
      // Update state by removing the deleted password
      setData(prevData => prevData.filter(item => item.id !== id));
      
      return true; // Indicate success
    } catch (error) {
      setError(error.message || 'Failed to delete password');
      console.error('Delete password error:', error);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };
  
  // Example login function
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isLoggedIn', 'true');
      
      return true; // Indicate success
    } catch (error) {
      setError(error.message || 'Authentication failed');
      console.error('Login error:', error);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>API Integration Example</h2>
      
      {/* Display loading state */}
      {loading && <p>Loading...</p>}
      
      {/* Display error message if any */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* Display data */}
      {data && (
        <div>
          <h3>Your Passwords</h3>
          <ul>
            {data.map(item => (
              <li key={item.id}>
                {item.name} - {item.username}
                <button onClick={() => handleUpdatePassword(item.id, { ...item, name: 'Updated' })}>
                  Update
                </button>
                <button onClick={() => handleDeletePassword(item.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Example form for creating a new password */}
      <div>
        <h3>Add New Password</h3>
        <button 
          onClick={() => 
            handleCreatePassword({
              name: 'Example Site',
              username: 'user@example.com',
              website: 'example.com',
              password: 'ExampleP@ss123'
            })
          }
        >
          Add Example Password
        </button>
      </div>
      
      {/* Example login form */}
      <div>
        <h3>Login Example</h3>
        <button 
          onClick={() => handleLogin('user@example.com', 'password123')}
        >
          Login Example
        </button>
      </div>
    </div>
  );
}

export default ApiIntegrationExample;

// Note: This is just an example component to demonstrate API integration.
// In a real application, you would handle state management more effectively,
// possibly using React Context or a state management library like Redux. 