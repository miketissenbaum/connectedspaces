Meteor.startup(() => {
	// console.log(process.env.MONGO_URL);
	// console.log("cof");
	// export MONGO_URL = "mongodb://127.0.0.1:27017/local";
	process.env.MONGO_URL = "mongodb://visheshk:Mithrandir@127.0.0.1:27017/local";
});

rests = new Mongo.Collection("restaurants");