// import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';


// console.log("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// db = new MongoInternals.RemoteCollectionDriver("mongodb://" + mongo_user + ":" + mongo_pass + "@" +  mongo_ip + ":27017/cspace");
// export const members = new Mongo.Collection("members", {_driver: db});
// export const activities = new Mongo.Collection("activities", {_driver: db});

date = new Date();

Meteor.startup(() => {

    // SSLProxy({
    //    port: 6000, //or 443 (normal port/requires sudo)
    //    ssl : {
    //         key: Assets.getText("server.key"),
    //         cert: Assets.getText("server.crt"),
    //         //Optional CA
    //         //Assets.getText("ca.pem")
    //    }
    // });

	// console.log(rests.findOne({}));
	// console.log(members.findOne({}));
    // code to run on server at startup

    requestDuration = 300000;

    Meteor.publish('userPresence', function() {
      // Setup some filter to find the users your user
      // cares about. It's unlikely that you want to publish the 
      // presences of _all_ the users in the system.

      // If for example we wanted to publish only logged in users we could apply:
      // filter = { userId: { $exists: true }};
      var filter = {}; 

      return Presences.find(filter, { fields: { state: true, userId: true, peerID: true }});
    });


    Meteor.methods({
        // refineDbs: function () {
        //     if (find)
        // },

        addLog: function (logObject) {
            logObject["version"] = "cspace_0.2.2";
            logObject["epoch"] = (new Date()).getTime();
            console.log("adding log");
            eventLogs.insert(logObject);
        },

        createMember: function(memId, name, zipcode) {
            members.insert({
                "MemberID": memId,
                "Name": name,
                "Zipcode": zipcode,
                "CreatedAt": (new Date()).getTime()
            });
            return name;
        },

        logActivity: function(memId, name, activity, locationID, location) {
            Meteor.call("logOut", memId);
            activities.insert({
                "LoggedIn": (new Date()).getTime(),
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
            activities.update({"MemberID": memId}, {$set: {"Status": "out", "LogOutTime": (new Date()).getTime()}}, {multi: true});
            return true;
        },

        checkLogins: function () {
            console.log("checking")
            timeOut = 18000000;
            // timeOut = 5000;
            activities.find({$and: [{"LoggedIn": {$lt: ((new Date()).getTime() - timeOut)}}, {"Status": "in"}]}).forEach(function (doc) {
                Meteor.call("logOut", doc.MemberID);
                console.log("logging out " + doc.MemberID);
            });
        },

        test: function (tex) {
            console.log(tex);
        },

        getLiveRequests: function (room) {
            // return helpRequests.find({$and: [{"room": Meteor.userId(), "requestCreated": {$gt: date.getTime() - 300000}}]});
            return null;
        },

        requestHelp: function (room, affinity, helpee) {
            // if (helpRequests.find({$and: [{"room": room, "affinity": affinity, "helpee": helpee, "requestCreated": {$gt: date.getTime() - requestDuration}}]}) == undefined) {
                console.log("adding request " + room + " " + affinity + " " + helpee);
                helpRequests.insert({
                    "room": room,
                    "affinity": affinity,
                    "helpee": helpee,
                    "requestCreated": (new Date()).getTime(),
                    "resolved": false
                });
                
            // }
            // else{
            //     console.log("not adding request");
            // }
            
        },

        resolveRequest: function (reqId, helperId, comments) {
            helperDeets = {};
            helper = smallGroups.findOne({"_id": helperId});
            if (helper != null) {
                helperDeets = {"name": helper.student, "team": helper.team, "affinities": helper.affinities};
            }
            helpRequests.update(
                { "_id": reqId },
                {$set:{
                    "resolved": true,
                    "helperId": helperId,
                    "helperDetails": helperDeets,
                    "comments": comments
                }}
            )
        },

        addAffinity: function (room, affinity, faclass) {
            affinities.update({
                $and:[
                    {"room": room},
                    {"affinity": affinity}
                ]
            }, {
                "room": room,
                "affinity": affinity,
                "faclass": faclass
            }, {
                upsert: true
            });
        },

        addBoxPerson: function (room, team, student, affinities, visibility) {
            if (visibility == false) {
                smallGroups.update({
                    $and: 
                        [{"room": room}, 
                        {"team": team}, 
                        {"student": student}]
                }, {
                    $set: {"visibility": false}
                })
            }
            else {
                smallGroups.update({
                    $and: 
                        [{"room": room}, 
                        {"team": team}, 
                        {"student": student}]
                }, {
                    "room": room, 
                    "team": team, 
                    "student": student, 
                    "affinities": affinities,
                    "visibility": true
                }, {
                    upsert: true
                });
            }
            // smallGroups.update(
            //     {$and: [
            //         {"room": room}, 
            //         {"info": "boxList"}
            //     ]}, 
            //     {
            //         "room": room, 
            //         "info": "boxList", 
            //         // $addToSet: {"visibleBoxes": team}
            //     },
            //     {upsert: true}
            // );
            smallGroups.update({$and: [{"room": room}, {"info": "boxList"}]}, {$addToSet: {"existingBoxes": team}});
            smallGroups.update({$and: [{"room": room}, {"info": "boxList"}]}, {$addToSet: {"visibleBoxes": team}});

        },

        // updateVisibleBoxes

        setVisibleBoxes: function (uid, vboxes) {
            console.log(vboxes);
            if (vboxes.length == 0){
                console.log("filling smallGroup");
                // smallGroups.update({$and: [{"room": uid}, {"info": "boxList"}]}, {"room": uid, "info": "boxList", "visibleBoxes": vboxes}, {upsert: true});
                smallGroups.insert({"room": uid, "info": "boxList", "visibleBoxes": vboxes, "existingBoxes": []});
            }
            else if (vboxes.length > 0) {
                smallGroups.update({$and: [{"room": uid}, {"info": "boxList"}]}, {$set: {"visibleBoxes": vboxes}});   
            }
        },

        setDisplaySpace: function (uid, space1, space2) {
            displaySpaces.update(
                {"roomID": uid, "location": "space1"},
                {"roomID": uid, "location": "space1", "spaceID": space1},
                // {$setOnInsert: {"roomID": uid, "location": "space1"} },
                {upsert: true, multi:false} 
            );
            console.log(space1 + " " + uid);
            displaySpaces.update(
                {"roomID": uid, "location": "space2"},
                {"roomID": uid, "location": "space2", "spaceID": space2},
                {upsert: true, multi:false}
            );

        },

        changeTeamName: function (room, oldTeamName, newTeamName) {
            eventLog = {
                "key": "teamNameChange",
                "room": room,
                "oldTeamName": oldTeamName,
                "newTeamName": newTeamName,
                "existingBoxChanged": false
            }
            
            smallGroups.update({$and: [{"room": room}, {"team": oldTeamName}]}, {$set: {"team": newTeamName}});
            sgList = smallGroups.findOne({$and: [{"room": room}, {"info": "boxList"}]});
            visList = sgList.visibleBoxes;
            exisList = sgList.existingBoxes;
            if (visList.indexOf(oldTeamName) != -1) {
                visList[visList.indexOf(oldTeamName)] = newTeamName;
            }

            if (exisList.indexOf(oldTeamName) != -1) {
                exisList[exisList.indexOf(oldTeamName)] = newTeamName;
                eventLog["existingBoxChanged"] = true;
            }
            console.log(visList + " " + exisList);
            
            smallGroups.update({$and: [{"room": room}, {"info": "boxList"}]}, {$set: {
                "visibleBoxes": visList,
                "existingBoxes": exisList
            }});

            // smallGroups.update(
            //    {$and: [{"room": room}, {"info": "boxList"}]},
            //    { $set: { "visibleBoxes.$.[tnameMatch]" : newTeamName, "existingBoxes.$.[tnameMatch]" : newTeamName } },
            //    { 
            //      arrayFilters: [ { "tnameMatch": { $eq: oldTeamName } } ]
            //    }
            // )

            Meteor.call("addLog", eventLog);
        }
    });

    // Meteor.setInterval(function () {
    //     Meteor.call('checkLogins');
    // }, 300000);
    // }, 1000);
});


Meteor.publish('members', function tasksPublication() {
    return members.find();
});

Accounts.onCreateUser(function (options, user) {
    // space1 = user._id;
    // console.log(Meteor.users);
    console.log(user._id); 
    // space2 = Meteor.users.findOne()._id;
    // displaySpaces.update({
    //     $and: [{"roomID": user._id}, {"location": "space1"}]
    // },
    // {$set: {$"spaceID": space1} },
    // // {$setOnInsert: {"roomID": uid, "location": "space1"} },
    // {upsert: true} );
    
    // displaySpaces.update(
    //     {$and: [
    //         {"roomID": user._id}, 
    //         {"location": "space2"}
    //     ]},
    //     {$set: {$"spaceID": space2} },
    // // {$setOnInsert: {"roomID": uid, "location": "space1"} },
    //     {upsert: true}
    // );

    Meteor.call("setDisplaySpace", user._id, user._id, user._id);
    Meteor.call("setVisibleBoxes", user._id, []);
    // smallGroups.update({$and: [{"room": room}, {"info": "boxList"}]}
    return user;
});