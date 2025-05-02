import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AddPasswordModal from '../components/AddPasswordModal';
import EditPasswordModal from '../components/EditPasswordModal';
import Header from '../components/Header';
import { ENDPOINTS } from '../config/api';
import { apiRequest } from '../config/api';

// Sample data
const initialPasswords = [
  {
    id: 1,
    name: 'Gmail',
    username: 'user@gmail.com',
    website: 'gmail.com',
    password: 'p@ssw0rd123',
    created: 'Nov 20, 2022',
    updated: 'May 15, 2023',
  },
  {
    id: 2,
    name: 'GitHub',
    username: 'devuser',
    website: 'github.com',
    password: 'dev!P@ssw0rd',
    created: 'Dec 5, 2022',
    updated: 'Jun 20, 2023',
  },
  {
    id: 3,
    name: 'Netflix',
    username: 'user@example.com',
    website: 'netflix.com',
    password: 'n3tfl!xP@ss',
    created: 'Jan 15, 2023',
    updated: 'Jul 10, 2023',
  },
  {
    id: 4,
    name: 'Amazon',
    username: 'user123',
    website: 'amazon.com',
    password: 'Am@z0n!2023',
    created: 'Feb 28, 2023',
    updated: 'Aug 5, 2023',
  },
];

function Dashboard({ onLogout }) {
  const [passwords, setPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create a map of refs for each dropdown menu
  const dropdownRefs = useRef({});

  useEffect(() => {
    // API INTEGRATION POINT:
    // Replace this with actual API call to fetch passwords
    // Example:
    // async function fetchPasswords() {
    //   try {
    //     setIsLoading(true);
    //     const token = localStorage.getItem('token');
    //     const response = await fetch('/api/passwords', {
    //       headers: {
    //         'Authorization': `Bearer ${token}`
    //       }
    //     });
    //     
    //     if (!response.ok) throw new Error('Failed to fetch passwords');
    //     
    //     const data = await response.json();
    //     setPasswords(data.passwords);
    //   } catch (error) {
    //     console.error('Error fetching passwords:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // 
    // fetchPasswords();

    // For now, using localStorage as a mock backend
    const savedPasswords = localStorage.getItem('passwords');
    if (savedPasswords) {
      setPasswords(JSON.parse(savedPasswords));
    } else {
      setPasswords(initialPasswords);
      localStorage.setItem('passwords', JSON.stringify(initialPasswords));
    }
    setIsLoading(false);

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

  // Create a ref for each password item
  const createRef = (id) => {
    if (!dropdownRefs.current[id]) {
      dropdownRefs.current[id] = React.createRef();
    }
    return dropdownRefs.current[id];
  };

  const filteredPasswords = passwords.filter(
    (password) =>
      password.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.website.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddPassword = (newPassword) => {
    // API INTEGRATION POINT:
    // Replace this with actual API call to create a new password
    // Example:
    // async function createPassword(passwordData) {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const response = await fetch('/api/passwords', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //       },
    //       body: JSON.stringify(passwordData)
    //     });
    //     
    //     if (!response.ok) throw new Error('Failed to create password');
    //     
    //     const data = await response.json();
    //     setPasswords([...passwords, data.password]);
    //     setShowAddModal(false);
    //   } catch (error) {
    //     console.error('Error creating password:', error);
    //     alert('Failed to create password. Please try again.');
    //   }
    // }
    // 
    // createPassword(newPassword);

    // For now, using local state as a mock backend
    const id = passwords.length > 0 ? Math.max(...passwords.map((p) => p.id)) + 1 : 1;
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    setPasswords([
      ...passwords,
      {
        id,
        ...newPassword,
        created: today,
        updated: today,
      },
    ]);
    setShowAddModal(false);
  };

  const handleEditPassword = (updatedPassword) => {
    // API INTEGRATION POINT:
    // Replace this with actual API call to update a password
    // Example:
    // async function updatePassword(passwordData) {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const response = await fetch(`/api/passwords/${passwordData.id}`, {
    //       method: 'PUT',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //       },
    //       body: JSON.stringify(passwordData)
    //     });
    //     
    //     if (!response.ok) throw new Error('Failed to update password');
    //     
    //     const data = await response.json();
    //     setPasswords(
    //       passwords.map((password) => 
    //         password.id === data.password.id ? data.password : password
    //       )
    //     );
    //     setShowEditModal(false);
    //     setActiveDropdown(null);
    //   } catch (error) {
    //     console.error('Error updating password:', error);
    //     alert('Failed to update password. Please try again.');
    //   }
    // }
    // 
    // updatePassword(updatedPassword);

    // For now, using local state as a mock backend
    setPasswords(
      passwords.map((password) =>
        password.id === updatedPassword.id
          ? {
              ...updatedPassword,
              updated: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            }
          : password,
      ),
    );
    setShowEditModal(false);
    setActiveDropdown(null);
  };

  const handleDeletePassword = (id) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      // API INTEGRATION POINT:
      // Replace this with actual API call to delete a password
      // Example:
      // async function deletePassword(passwordId) {
      //   try {
      //     const token = localStorage.getItem('token');
      //     const response = await fetch(`/api/passwords/${passwordId}`, {
      //       method: 'DELETE',
      //       headers: {
      //         'Authorization': `Bearer ${token}`
      //       }
      //     });
      //     
      //     if (!response.ok) throw new Error('Failed to delete password');
      //     
      //     setPasswords(passwords.filter(password => password.id !== passwordId));
      //     setActiveDropdown(null);
      //   } catch (error) {
      //     console.error('Error deleting password:', error);
      //     alert('Failed to delete password. Please try again.');
      //   }
      // }
      // 
      // deletePassword(id);

      // For now, using local state as a mock backend
      setPasswords(passwords.filter((password) => password.id !== id));
      setActiveDropdown(null);
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords({
      ...visiblePasswords,
      [id]: !visiblePasswords[id],
    });
  };

  const toggleDropdown = (id, e) => {
    // Stop event propagation to prevent immediate closing
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Create and show a temporary notification
        const notification = document.createElement('div');
        notification.textContent = `${type} copied to clipboard!`;
        notification.className = "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50";
        document.body.appendChild(notification);
        
        // Remove the notification after 2 seconds
        setTimeout(() => {
          notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
          setTimeout(() => document.body.removeChild(notification), 500);
        }, 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        alert(`Failed to copy ${type.toLowerCase()}.`);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} title="Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold">Your Passwords</h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
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

        {filteredPasswords.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">No passwords found. Add your first password to get started.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
                          <span className="font-mono">{visiblePasswords[password.id] ? password.password : '••••••••••'}</span>
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
                          {visiblePasswords[password.id] && (
                            <button
                              onClick={() => copyToClipboard(password.password, 'Password')}
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
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setCurrentPassword(password);
                                    setShowEditModal(true);
                                  }}
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
                                  onClick={() => copyToClipboard(password.password, 'Password')}
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
    </div>
  );
}

export default Dashboard; 