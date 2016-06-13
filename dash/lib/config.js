Meteor.startup(() => {
	// console.log(process.env.MONGO_URL);
	// console.log("cof");
	// export MONGO_URL = "mongodb://127.0.0.1:27017/local";
	process.env.MONGO_URL = "mongodb://username:password@52.41.24.224:27017/cspace";
});

// rests = new Mongo.Collection("restaurants");

var db = new MongoInternals.RemoteCollectionDriver("mongodb://username:password@52.41.24.224:27017/cspace");
Members = new Mongo.Collection("Members", {_driver: db});