const db = require("../config/db");

const postForm = async (req, res) => {
  try {
    const {
      form_link_id,
      owner_id,
      client_name,
      client_email,
      client_phone,
      data,
      ip_address = req.ip,
      user_agent = req.get('User-Agent'),
    } = req.body;

    if (!form_link_id || !owner_id || !data) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const submission = await createSubmission(
      form_link_id,
      owner_id,
      client_name,
      client_email,
      client_phone,
      data,
      ip_address,
      user_agent
    );

    res.status(201).json({ message: "Submission created", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create submission" });
  }
};

const createSubmission = async (form_link_id, owner_id, client_name, client_email, client_phone, data, ip_address, user_agent) => {
  try {
    const [result] = await db.query(
      "INSERT INTO submissions (form_link_id, owner_id, client_name, client_email, client_phone, data, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [form_link_id, owner_id, client_name, client_email, client_phone, JSON.stringify(data), ip_address, user_agent]
    );
    return { id: result.insertId, form_link_id, owner_id, client_name, client_email, client_phone, data, ip_address, user_agent };
  } catch (err) {
    console.error("Error creating submission:", err);
    throw err;
  }
};

module.exports = {
  postForm,
};