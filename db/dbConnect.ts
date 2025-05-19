import mongoose from "mongoose";

const dbConnect = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log(`Already connected to MongoDB: ${mongoose.connection.host}`);
      return;
    }

    await mongoose.connect(process.env.MONGO_DB_URI!);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    mongoose.connection.on("error", (error) => {
      console.log(`MongoDB connection error: ${error.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};

export default dbConnect;
