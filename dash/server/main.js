// import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';


// console.log("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// export const members = new Mongo.Collection("members", {_driver: db});
// export const activities = new Mongo.Collection("activities", {_driver: db});

date = new Date();

Meteor.startup(() => {
	// console.log(rests.findOne({}));
	// console.log(members.findOne({}));
    // code to run on server at startup
    Meteor.methods({
        createMember: function(memId, name, zipcode) {
            members.insert({
                "MemberID": memId,
                "Name": name,
                "Zipcode": zipcode,
                "CreatedAt": date.getTime()
            });
            return name;
        },

        logActivity: function(memId, name, activity, locationID, location) {
            Meteor.call("logOut", memId);
            activities.insert({
                "LoggedIn": date.getTime(),
                "Name": name,
                "MemberID": memId,
                "CurrentActivity": activity,
                "Location": location,
                "locationID": locationID,
                "Status": "in"
            });
            return "logged";
        },

        clearCardUser: function (memId) {
            members.remove({"MemberID": memId});
            Meteor.call("logOut", memId);
            return "Card cleared";
        },

        logOut: function (memId) {
            activities.update({"MemberID": memId}, {$set: {"Status": "out", "LogOutTime": date.getTime()}}, {multi: true});
            return true;
        },

        checkLogins: function () {
            console.log("checking")
            timeOut = 1800000;
            // timeOut = 5000;
            activities.find({$and: [{"LoggedIn": {$lt: (date.getTime() - timeOut)}}, {"Status": "in"}]}).forEach(function (doc) {
                Meteor.call("logOut", doc.MemberID);
                console.log("logging out " + doc.MemberID);
            });
        },

        test: function (tex) {
            console.log(tex);
        }
    });

    Meteor.setInterval(function () {
        Meteor.call('checkLogins');
    }, 300000);
    // }, 1000);
});


Meteor.publish('members', function tasksPublication() {
    return members.find();
});