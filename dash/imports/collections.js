import { Mongo } from 'meteor/mongo';

if (Meteor.isServer){
	db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
}
export const members = new Mongo.Collection("members", {_driver: db});
export const activities = new Mongo.Collection("activities", {_driver: db});