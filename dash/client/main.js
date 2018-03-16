import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
// import { members } from '../server/imports/collections.js';
// import { activities } from '../imports/collections.js';

Session.set("locationSet", true);
Session.set("refreshBox", true);
Session.set("peerId", 0);

Session.set("streamSettings", {audio: true, video: true});

Meteor.subscribe('userPresence');

Template.boxes.helpers({
	spacesToDisplay: function () {
		return displaySpaces.find({"roomID": Meteor.userId()});
	},

	boxesToDisplay: function () {
		// u = Meteor.user();
		console.log(Meteor.userId());
		// teamnames = u.visibleBoxes;
		teamnames = smallGroups.findOne({$and: [{"room": Meteor.userId()}, {"info": "boxList"}]}).visibleBoxes;
		// console.log(teamnames);
		if (teamnames == undefined) {
			return null;
		}
		else {
			teamnames = teamnames.map(x => { return({"team": x}); });
			return teamnames;
		}
	},

	printAffinities: function () {
		console.log("Printing team before affinities: " + this.team);
	},

	spaceName: function () {
		// console.log(this.spaceID);
		return Meteor.users.findOne({_id: this.spaceID}).username;
	},

	teamMembers: function () {
		// console.log (this.team);
		return smallGroups.find({$and: [{"room": Meteor.userId()}, {"team": this.team}, {"affinity": {$ne: "-99"}}]});
	},

	fontAwesomeClass: function () {
		console.log(this.affinityName);
		affin = affinities.findOne({$and: [{"room": Meteor.userId()}, {"affinity": this.affinityName}]});
		// console.log(affin);
		if (affin == null) {
			return null;
		}
		else {
			return affin.faclass;
		}
	},

	allData: function() {
		// Mousetrap.bind('4', function() { console.log('4'); });
		// if (Session.get("locationSet") == true){
		// 	Session.set("locationSet", false);
		// }
		// console.log(Template.instance().paneLocation);
		// if (Template.instance().paneLocation != 0){
		// 	return activities.find({$and: [{locationID: Template.instance().paneLocation}, {Status: "in"}]}).fetch();
		// }
		// else {
		// 	return activities.find({$and: [{locationID: Meteor.users.findOne()._id}, {Status: "in"}]}).fetch();
		// }
		// console.log(this.spaceID);
		thisID = this.spaceID;
		return activities.find({$and: [{locationID: thisID}, {Status: "in"}]}).fetch();
	}
});

// Template.eachBox.helpers({
	

// 	otherLocations: function () {
// 		users = Meteor.users.find({_id: {$ne: Meteor.userId()}});
// 		// numb = users.count();
// 		return users;
// 	},

	
// });

// Template.eachBox.events({
// 	"change .locationSelector": function (event) {
// 		event.preventDefault();
// 		// a = event;
// 		Template.instance().paneLocation = event.currentTarget.location.value;
// 		// Template.instance().paneLocation2 = event.currentTarget.location2.value;
// 		// console.log("in change form thing " + Template.instance().paneLocation);
// 		Session.set("locationSet", true);
// 	}
// });

Template.activityEntry.helpers({
	name() {
		chosenAction = ""
		Mousetrap.bind('m', function() { 
			chosenAction = "3D Modeling";
			console.log(chosenAction); 
			logAct(chosenAction);
		});
		Mousetrap.bind('p', function() { 
			chosenAction = "Programming";
			console.log(chosenAction); 
			logAct(chosenAction);
		});
		Mousetrap.bind('v', function() { 
			chosenAction = "Video Production";
			console.log(chosenAction); 
			logAct(chosenAction);
		});

		logAct = function (act) {
			Meteor.call("logActivity", 
				Session.get("Member"), 
				Session.get("Name"), 
				act, 
				Meteor.userId(), 
				Meteor.user().username, 
					function (err, res){
				if(err){
					alert("couldn't log activity! Something wrong with server :(");
					Router.go('/');
				}
				else {
					Router.go('/');
				}
			});
		}

		memb = members.findOne({"MemberID": Session.get("Member")});
		if (memb != undefined){
			Session.set("Name", members.findOne({"MemberID": Session.get("Member")}).Name);	
		}
		else {
			Session.set("Name", "");
		}
		return Session.get("Name");
	}
});

Template.activityEntry.events({
	'submit .activityForm': function(event) {
		event.preventDefault();
		Meteor.call("logActivity", 
			Session.get("Member"), 
			Session.get("Name"), 
			event.target.activity.value, 
			Meteor.userId(), 
			Meteor.user().username, 
			function (err, res){
			if(err){
				alert("couldn't log activity! Something wrong with server :(");
				Router.go('/');
			}
			else {
				Router.go('/');
			}
		});
	},

	'click .updateCard': function(event) {
		console.log('want to');
		Meteor.call("clearCardUser", Session.get("Member"), function (err, res){
			if(err) {
				alert("Server troubles :(");
				Router.go("/");
			}
			else {
				Router.go("/newMember");
			}
		})
	},

	'click .logOut': function (event) {
		Meteor.call("logOut", Session.get("Member"), function(err, res) {
			if (err){
				alert("Server failed to log you out :(")
				Router.go('/');
			}
			else {
				Router.go('/');
			}
		});
	}
});

Template.signUp.events({
	'submit .signup': function(event) {
		event.preventDefault();
		Meteor.call("createMember", 
			Session.get("Member"), 
			event.target.name.value, 
			event.target.zipcode.value, function (err, res) {
			if (err) {
				alert("sign up failed at server end! :(");
			}
			else {
				console.log(res)
				Session.set("Name", res);
				Router.go('/actitout');
			}
		});
	}
});

Template.legend.helpers({
	allAffinities: function () {
		return affinities.find({$and: [{"room": Meteor.userId()}, {"affinity": {$ne: "-99"}}]});
	}
});

Template.askHelp.helpers({
	allAffinities: function () {
		return affinities.find({$and: [{"room": Meteor.userId()}, {"affinity": {$ne: "-99"}}]});
	},

	allMembers: function () {
		return smallGroups.find({$and: [{"room": Meteor.userId()}]}, {sort: {"team": 1}});
	},
});

Template.askHelp.events({
	'submit .helpRequest': function (event) {
		event.preventDefault();
		console.log(Meteor.userId() + " " + event.target.affinity.value + " " + event.target.member.value);
		Meteor.call("requestHelp", Meteor.userId(), event.target.affinity.value, event.target.member.value);
	}
});

Template.activeRequests.helpers({
	aliveRequests: function () {
		return helpRequests.find({$and: [{"room": Meteor.userId(), "requestCreated": {$gt: Date.now() - 300000}}]});
	},

	// helpeeName: function () {
	// 	return smallGroups.findOne({$and: [{"room": Meteor.userId()}, {}]})
	// }
});

Template.administration.helpers({
	otherLocations: function () {
		// users = Meteor.users.find({_id: {$ne: Meteor.userId()}});
		users = Meteor.users.find();

		// numb = users.count();
		return users;
	},

	boxes: function () {
		// teamnames = smallGroups.distinct("team", {"room": Meteor.userId()});
		// teamnames = Meteor.users.findOne({"_id": Meteor.userId()}).visibleBoxes;
		// teamnames = Meteor.user().visibleBoxes;
		teamnames = smallGroups.findOne({$and: [{"room": Meteor.userId()}, {"info": "boxList"}]}).existingBoxes;
		// console.log(teamnames);
		if (teamnames == undefined) {
			return null;
		}
		else {
			teamnames = teamnames.map(x => { return({"team": x}); });
			return teamnames;
		}
	},
});

Template.administration.events({
	'submit .addPerson': function(event) {
		event.preventDefault();
		affs = event.target.affinity.value.split(",");
		console.log(affs);
		affs = affs.map(function(s) { console.log(s); return {"affinityName": String.prototype.trim.apply(s)}; });
		console.log(affs);
		Meteor.call("addBoxPerson", Meteor.userId(), event.target.teamName.value, event.target.studName.value, affs);
		// Router.go("/");
	},

	'submit .addAffinity': function(event) {
		event.preventDefault();
		console.log("adding affinity");
		Meteor.call("addAffinity", Meteor.userId(), event.target.affinityName.value, event.target.faclass.value);
		// Router.go("/");
	},

	'submit .boxSelector': function(event) {
		event.preventDefault();
		// console.log(event);
		// console.log(event.target.children[0].checked);
		checks = [];
		for (i = 0; i < event.target.children.length - 1; i++) {
			// console.log(i);
			// console.log(i + " " + event.target.children[i].checked);
			if (event.target.children[i].checked) {
				checks.push(event.target.children[i].name);
			}
		}
		console.log(checks);
		if (checks.length > 0){
			Meteor.call("setVisibleBoxes", Meteor.userId(), checks)
		}
		// else {

		// }
		// Meteor.call("setDisplayBoxes", Meteor.userId(), event.target.teamName.value, event.target.studName.value, event.target.affinity.value);
		// Router.go("/");
	},

	'submit .locationSelector': function(event) {
		event.preventDefault();
		Meteor.call("setDisplaySpace", Meteor.userId(), event.target.location1.value, event.target.location2.value);
		Router.go("/");
	},

	'click .logOut': function () {
		// console.log("logging out?");
		AccountsTemplates.logout();
		Router.go('/setLocation');
	}
});


