// import { Mongo } from 'meteor/mongo';

// if (Meteor.isServer){
// 	db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// }
// members = new Mongo.Collection("members", {_driver: db});
members = new Mongo.Collection("members");
// console.log(members.findOne());
activities = new Mongo.Collection("activities");

displaySpaces = new Mongo.Collection("displaySpaces");

// presences = new Mongo.Collection("presences");

smallGroups = new Mongo.Collection("smallGroups");

affinities = new Mongo.Collection("affinities");

helpRequests = new Mongo.Collection("helpRequests");

eventLogs = new Mongo.Collection("eventLogs");
