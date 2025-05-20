import React, { useState, useEffect } from 'react';

function EditPasswordModal({ password, onClose, onSave }) {
  const [name, setName] = useState(password.name);
  const [username, setUsername] = useState(password.username);
  const [website, setWebsite] = useState(password.website);
  const [passwordValue, setPasswordValue] = useState(password.password || '••••••••••••••••');
  const [passwordLength, setPasswordLength] = useState(password.password?.length || 16);
  const [showPassword, setShowPassword] = useState(false);

  // Sync state with password prop when it changes (especially password value)
  useEffect(() => {
    setName(password.name);
    setUsername(password.username);
    setWebsite(password.website);
    setPasswordValue(password.password || '••••••••••••••••');
    setPasswordLength(password.password?.length || 16);
  }, [password]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let generatedPassword = '';
    for (let i = 0; i < passwordLength; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordValue(generatedPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...password,
      name,
      username,
      website,
      password: passwordValue,
    });
  };

  // Calculate days since last update
  const lastUpdated = new Date(password.updated);
  const today = new Date();
  const daysSinceUpdate = Math.floor((today - lastUpdated) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl sm:max-w-lg w-full max-h-[90vh] flex flex-col overflow-y-auto">
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-1">Edit Password</h2>
          <p className="text-gray-600 mb-6">Update the details for this password entry</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <div className="flex justify-between">
                <div>Created: {password.created}</div>
                <div>Last Updated: {password.updated}</div>
              </div>
            </div>

            {daysSinceUpdate > 90 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-yellow-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-yellow-700">Password Age Warning</p>
                    <p className="text-sm text-yellow-600">
                      This password hasn't been updated in over 90 days. Regular updates help maintain security.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md pr-36"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-2 text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-2 text-gray-600 hover:text-gray-800"
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
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPasswordModal; 