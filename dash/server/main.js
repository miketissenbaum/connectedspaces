import { Meteor } from 'meteor/meteor';
console.log("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
var db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
members = new Mongo.Collection("Members", {_driver: db});


Meteor.startup(() => {
	// console.log(rests.findOne({}));
	console.log(members.findOne({}));
  // code to run on server at startup
});
