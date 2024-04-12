import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.SFTP_PORT,
  host: process.env.SFTP_HOST || "localhost",
  username: process.env.USER_NAME,
  password: process.env.PASSWORD
};
