import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


// console.log("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// export const members = new Mongo.Collection("members", {_driver: db});
// export const activities = new Mongo.Collection("activities", {_driver: db});


Meteor.startup(() => {
	// console.log(rests.findOne({}));
	// console.log(members.findOne({}));
  // code to run on server at startup
});
