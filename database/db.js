import mongoose from "mongoose";

const MAX_RETIRES = 3;
const RETRY_INTERVAL = 5000;

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    //configure mpgoose settings
    mongoose.set("strictQuery", true);
    mongoose.connection.on("connected", () => {
      console.log("Mongoose is connected🥰");
    });
    mongoose.connection.on("error", () => {
      console.log("Mongoose connection Error🥲");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose is disconnected🥲");
      this.handledisConnection();
    });

    process.on("SIGTERM".this.handleAppTermination().bind(this));
  }
  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in env variables");
      }
      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, //use ipv4
      };
      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0;
    } catch (error) {
      console.error(error.message);
      await this.handleConnectionError();
    }
  }
  async handleConnectionError() {
    if (this.retryCount < MAX_RETIRES) {
      this.retryCount++;
      console.log(
        `Retrying connection...Attempt${this.retryCount} of ${MAX_RETIRES}`,
      );
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve;
        }, RETRY_INTERVAL),
      );
      return this.connect();
    } else {
      console.error(
        `Failed to connnect to MongoDB after ${MAX_RETIRES} attempts`,
      );
      process.exit(1);
    }
  }

  async handledisConnection() {
    if (!this.isConnected) {
      console.log("Attempting to Rcconnecet to mongoDB");
      this.connect();
    }
  }
  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through the app termination");
      process.exit(0);
    } catch (error) {
      console.error("Error during database disconnection:", error);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnection: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

//create a singleton instance
const databaseConnection = new DatabaseConnection();
export default databaseConnection.connect.bind(databaseConnection);

export const getDBstatus =
  databaseConnection.getConnectionStatus.bind(databaseConnection);
