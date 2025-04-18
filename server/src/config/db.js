/**
 * Database Configuration Module
 *
 * Provides MongoDB connection configuration with optimized settings
 * for production use. Includes connection pooling, timeouts, and
 * retry logic for robust database operations.
 *
 * @module config/db
 */

const MongoClient = require("mongodb").MongoClient;

/**
 * Database configuration object
 * @typedef {Object} DbConfig
 * @property {string} mongoURI - MongoDB connection URI
 * @property {Object} options - MongoDB connection options
 */
const dbConfig = {
  // MongoDB Atlas URI with fallback to local development database
  mongoURI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/contractor-quotes",

  // MongoDB connection options
  options: {
    /**
     * Write Concern Configuration
     * Ensures data durability by requiring acknowledgment from majority of nodes
     */
    writeConcern: {
      w: "majority", // Write must be acknowledged by majority of replicas
      j: true, // Write must be written to journal
      wtimeout: 5000, // Timeout for write concern in milliseconds
    },

    /**
     * Read Preference Configuration
     * Defines how reads are routed to replica set members
     */
    readPreference: "primary", // Prefer reading from primary node
    readConcern: { level: "local" }, // Read from primary's data without guarantee of replication

    /**
     * Connection Pool Settings
     * Optimizes connection management for better performance
     */
    maxPoolSize: process.env.MONGODB_POOL_SIZE || 10, // Maximum connections in pool
    minPoolSize: 5, // Minimum connections maintained in pool
    maxIdleTimeMS: 30000, // Maximum idle time before connection is closed

    /**
     * Timeout Settings
     * Prevents hanging operations and ensures responsive behavior
     */
    serverSelectionTimeoutMS: 5000, // Time to wait for server selection
    socketTimeoutMS: 45000, // Time to wait for socket operations
    connectTimeoutMS: 10000, // Time to wait for initial connection

    /**
     * Monitoring Settings
     * Configures connection health checks and logging
     */
    heartbeatFrequencyMS: 10000, // Frequency of connection health checks
    monitorCommands: process.env.NODE_ENV === "development", // Monitor commands in development

    /**
     * Reliability Settings
     * Enables automatic retry of failed operations
     */
    retryWrites: true, // Automatically retry failed writes
    retryReads: true, // Automatically retry failed reads

    /**
     * Development Features
     * Additional features enabled in development environment
     */
    autoIndex: process.env.NODE_ENV === "development", // Auto-create indexes in development

    /**
     * Performance Settings
     * Optimizations for better performance
     */
    compressors: ["zlib"], // Enable compression for network transfer
    family: 4, // Use IPv4 (add 6 for IPv6 support)
  },
};

/**
 * Connection Pool Cache
 * Maintains database connections to prevent connection leaks
 * @private
 */
const connectionPool = new Map();

/**
 * Get database connection from pool or create new one
 * @async
 * @param {string} [uri] - Optional URI to override default
 * @returns {Promise<MongoClient>} Connected MongoDB client
 * @throws {Error} If connection fails
 */
const getConnection = async (uri = dbConfig.mongoURI) => {
  if (!connectionPool.has(uri)) {
    try {
      const client = await MongoClient.connect(uri, dbConfig.options);
      connectionPool.set(uri, client);

      // Handle connection events
      client.on("close", () => {
        connectionPool.delete(uri);
        console.log("Database connection closed");
      });

      client.on("error", (err) => {
        console.error("Database connection error:", err);
      });

      return client;
    } catch (err) {
      console.error("Failed to connect to database:", err);
      throw err;
    }
  }
  return connectionPool.get(uri);
};

/**
 * Close all database connections
 * @async
 * @returns {Promise<void>}
 */
const closeAllConnections = async () => {
  const closePromises = Array.from(connectionPool.values()).map((client) =>
    client.close()
  );
  await Promise.all(closePromises);
  connectionPool.clear();
};

// Register cleanup handler
process.on("SIGINT", async () => {
  await closeAllConnections();
  process.exit(0);
});

module.exports = {
  dbConfig,
  getConnection,
  closeAllConnections,
};
