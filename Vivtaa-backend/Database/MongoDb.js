const mongoose = require('mongoose');


const MongoDBconnection = async () => {
    try {
        const dbURI = process.env.MONGODB_CONNECTION_STRING;
        
        await mongoose.connect(dbURI);
        console.log('DB Connected Successfully');
    } catch (error) {
        console.error('DB Connection is Fail',error);
    }
};

module.exports = MongoDBconnection;

