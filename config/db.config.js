import mongoose from "mongoose";

const conn = async () => {

    try {
        
        await mongoose.connect(process.env.DB_CONN_STR)
    } catch (error) {
        console.log(error.message || 'Mongoose error while connecting');
    }
}

export default conn;