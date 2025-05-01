
const supabase = require('../config/supabaseClient');

exports.createPassword = async (req, res) => {
  const { userID, iv, username, encryptedPass, siteName, websiteURL } = req.body;

  const { data, error } = await supabase.from('Password').insert([
    {
      UserID: userID,
      IV: iv,
      Username: username,
      EncryptedPass: encryptedPass,
      SiteName: siteName,
      WebsiteURL: websiteURL,
    },
  ]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
};

exports.getPasswordsByUser = async (req, res) => {
  const { userID } = req.params;

  const { data, error } = await supabase
    .from('Password')
    .select('*')
    .eq('UserID', userID);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
