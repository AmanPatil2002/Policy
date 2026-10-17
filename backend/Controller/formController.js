// CREATE TABLE submissions (
//   id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
//   form_link_id  BIGINT UNSIGNED NOT NULL,
//   owner_id      BIGINT UNSIGNED NOT NULL,
//   client_name   VARCHAR(190) NULL,
//   client_email  VARCHAR(190) NULL,
//   client_phone  VARCHAR(40)  NULL,
//   data          JSON NOT NULL,
//   ip_address    VARBINARY(16) NULL,                    
//   user_agent    VARCHAR(300) NULL,
//   submitted_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   PRIMARY KEY (id),
//   UNIQUE KEY uq_submissions_link (form_link_id),
//   KEY idx_submissions_owner (owner_id, submitted_at),
//   KEY idx_submissions_submitted (submitted_at),
//   KEY idx_submissions_phone (client_phone),
//   KEY idx_submissions_email (client_email),
//   CONSTRAINT chk_submissions_data CHECK (JSON_VALID(data)),
//   CONSTRAINT fk_submissions_link
//     FOREIGN KEY (form_link_id) REFERENCES form_links(id)
//     ON DELETE RESTRICT,
//   CONSTRAINT fk_submissions_owner
//     FOREIGN KEY (owner_id) REFERENCES users(id)
//     ON DELETE RESTRICT
// );

const db = require("../config/db");

const postForm = (req, res) => {

  
};

module.exports = {
  postForm,
  
};