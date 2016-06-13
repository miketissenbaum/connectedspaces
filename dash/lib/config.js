Meteor.startup(() => {
	// console.log(process.env.MONGO_URL);
	// console.log("cof");
	// export MONGO_URL = "mongodb://127.0.0.1:27017/local";
	// process.env.MONGO_URL = "mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace";
});

// rests = new Mongo.Collection("restaurants");
// console.log("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// var db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// Members = new Mongo.Collection("Members", {_driver: db});