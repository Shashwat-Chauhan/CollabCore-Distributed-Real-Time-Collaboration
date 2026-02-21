import pkg from 'pg';
const { Pool } = pkg;

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false   // REQUIRED for Neon
      }
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');
      client.release();
      return true;
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      return false;
    }
  }

  async query(text, params) {
    try {
      return await this.pool.query(text, params);
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

}

export default new Database();
