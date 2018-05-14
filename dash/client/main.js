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
Session.set("viewMode", "teams");

Meteor.subscribe('userPresence');

Template.home.helpers({
	seeingTeams: function () {
		if (Session.get("viewMode") == "skills") {
			return false;
		}
		else {
			return true;
		}
	}
});

Template.home.events({
	'click .viewOption': function (event) {
		event.preventDefault();
		// console.log(a = event.target);
		view = Session.get("viewMode");
		if (view == "teams"){
			event.target.textContent = "Skill View";
			Session.set("viewMode", "skills");
		}
		else {
			event.target.textContent = "Team View";	
			Session.set("viewMode", "teams");
		}
		
	}
});

Template.skillBoxes.helpers({
	skillGroups: function () {
		roomId = Meteor.userId();

		affs = affinities.find({$and: [{"room": roomId}, {"faclass": {$ne: "-99"}}]}).fetch();
		affStudList = [];
		// console.log(affs);
		for (a in affs) {
			affStud = {};
			affStud["affinity"] = affs[a].affinity;
			affStud["faclass"] = affs[a].faclass;
			affStud["students"] = smallGroups.find({
				$and: [{"room": roomId}, 
				{"visibility": {$ne: false}}, 
				{"affinities.affinityName": affs[a].affinity} 
			]});
			affStudList.push(affStud);
			// console.log(affStud);
		}
		return affStudList;
	}

});


Template.teamBoxes.helpers({
	spacesToDisplay: function () {
		return displaySpaces.find({"roomID": Meteor.userId()});
	},

	boxesToDisplay: function () {
		// u = Meteor.user();
		currentUser = Meteor.userId();
		console.log(currentUser);
		// teamnames = u.visibleBoxes;
		if (currentUser != undefined) {
			teamnames = smallGroups.findOne({$and: [{"room": Meteor.userId()}, {"info": "boxList"}]}).visibleBoxes;
			// console.log(teamnames);
			if (teamnames == undefined) {
				return null;
			}
			else {
				teamnames = teamnames.map(x => { return({"team": x}); });
				return teamnames;
			}
		}
		else {
			return null;
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
		return smallGroups.find({$and: [{"room": Meteor.userId()}, {"team": this.team}, {"visibility": {$ne: false}}]});
	},

	fontAwesomeClass: function () {
		// console.log(this.affinityName);
		affin = affinities.findOne({$and: [{"room": Meteor.userId()}, {"affinity": this.affinityName}, {"faclass": {$ne: "-99"}}]});
		// console.log(affin);
		if (affin == null) {
			return null;
		}
		else {
			return affin.faclass;
		}
	},

	allData: function() {
		thisID = this.spaceID;
		return activities.find({$and: [{locationID: thisID}, {Status: "in"}]}).fetch();
	}
});


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
		eventLog = {
			"key": "signUpEvent",
			"room": event.target.name.value,
			"zipcode": event.target.zipcode.value,
			"success": "ambiguous"
		}
		
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

		Meteor.call("addLog", eventLog);
	}
});

Template.legend.helpers({
	allAffinities: function () {
		return affinities.find({$and: [{"room": Meteor.userId()}, {"faclass": {$ne: "-99"}}]});
	}
});

Template.askHelp.helpers({
	allAffinities: function () {
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
		}
		if (roomid != null){
			return affinities.find({$and: [{"room": roomid}, {"faclass": {$ne: "-99"}}]});
		}
	},

	allMembers: function () {
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
		}
		if (roomid != null){
			return smallGroups.find({$and: [{"room": roomid}, {"info": {$ne: "boxList"}} ]}, {sort: {"team": 1}});
		}
	}
});

Template.askHelp.events({
	'submit .helpRequest': function (event) {
		eventLog = {
			"key": "askHelpEvent",
			"room": "NA",
			"pageState": "loggedIn",
			"requestMakingSuccess": false,
			"helpSeeker": event.target.member.value,
			"affinity": event.target.affinity.value
		}
		
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
			eventLog["pageState"] = "userlessURL";
			eventLog["room"] = roomid;
		}
		event.preventDefault();
		if (event.target.member.value != "—") {
			console.log(roomid + " " + event.target.affinity.value + " " + event.target.member.value);
			Meteor.call("requestHelp", roomid, event.target.affinity.value, event.target.member.value);
			eventLog["requestMakingSuccess"] = true;
		}

		Meteor.call("addLog", eventLog);
	}
});

Template.activeRequests.helpers({
	aliveRequests: function () {
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
		}
		return helpRequests.find(
			{$and: [
				{"room": roomid , 
				"requestCreated": {$gt: Date.now() - 300000},
				"resolved": false}
			]}
		);
	},
	fontAwesomeClass: function () {
		console.log(this.affinityName);
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
		}
		
		affin = affinities.findOne({$and: [{"room": roomid}, {"affinity": this.affinity}]});
		// console.log(affin);
		if (affin == null) {
			return null;
		}
		else {
			return affin.faclass;
		}
	}

	// helpeeName: function () {
	// 	return smallGroups.findOne({$and: [{"room": Meteor.userId()}, {}]})
	// }
});

Template.resolveRequests.helpers({
	aliveRequests: function () {
		console.log("resolve requests called: ");
		// console.log(helpRequests.find(
		// 	{$and: [
		// 		{"room": Meteor.userId(), 
		// 		"requestCreated": {$gt: Date.now() - 300000}, 
		// 		"resolved": "false"} 
		// 	]}
		// ).fetch());
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
		}
		return helpRequests.find({
			$and: [
			{"room": roomid, 
			"requestCreated": {$gt: Date.now() - 300000}, 
			"resolved": false} ]
		});
	}
});

Template.resolveRequests.events({
	'click .requestResolution': function (event) {
		event.preventDefault();
		// return helpRequests.find({$and: [{"room": Meteor.userId(), "requestCreated": {$gt: Date.now() - 300000}}]});
		console.log(event.target.id);
		Session.set("resolveModalId", event.target.id);
		$("#myModal").modal('toggle');

		eventLog = {
			"key": "openHelpResolveForm",
			"helpCallId": event.target.id
		}
		Meteor.call("addLog", eventLog);	
	}
});

Template.resolve.helpers({
	potentialHelpers: function () {
		console.log(this.reqId);
		console.log(helpRequests.find({"_id": this.reqId}));
		roomid = Meteor.userId();
		if (roomid == null) {
			roomid = Session.get("helpRoom");
		}
		return smallGroups.find({$and: [{"room": roomid}, {"info": {$ne: "boxList"}} ]}, {sort: {"team": 1}});
	},

	requestInfo: function () {
		req = helpRequests.findOne({"_id": Session.get("resolveModalId")});
		if (req == null) {
			return "This modal doesn't belong to a valid request!";
			Session.set("resolveModalId", null);
			$("#myModal").modal('toggle');
			console.log("resolveModalId is invalid");
		}
		else {
			return "Request: " + req.helpee + " wants help in " + req.affinity + ".";
		}
	}
 });

Template.resolve.events({
	'submit .resolveForm': function (event) {
		event.preventDefault();
		// return helpRequests.find({$and: [{"room": Meteor.userId(), "requestCreated": {$gt: Date.now() - 300000}}]});
		console.log(event.target.helper.value);
		eventLog = {
			"key": "helpResolutionDialog",
			"action": "submit",
			"requestId": "NA"
		};

		if (Session.get("resolveModalId") != null) {
			Meteor.call("resolveRequest", Session.get("resolveModalId"), event.target.helper.value, event.target.resolveComments.value);
			console.log("form submitted successfully");
			eventLog["requestId"] = Session.get("resolveModalId");
			eventLog["helper"] = event.target.helper.value;
			eventLog["resolveComments"] = event.target.resolveComments.value;
		}
		event.target.resolveComments.value = "";
		$("#myModal").modal('toggle');

		Meteor.call("addLog", eventLog);
	},

	'click .modal-close': function (event) {
		eventLog = {
			"key": "helpResolutionDialogSubmit",
			"action": "cancel",
			"requestId": Session.get("resolveModalId"),
		};
		Meteor.call("addLog", eventLog);	
		Session.get("resolveModalId", null);
	}
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
		vis = true;
		if (affs == "-99")
			vis = false;
		affs = affs.map(function(s) { aff = String.prototype.trim.apply(s); return {"affinityName": aff}; });
		// console.log(affs);
		Meteor.call("addBoxPerson", Meteor.userId(), event.target.teamName.value, event.target.studName.value, affs, vis);

		eventLog = {
			"key": "addPersonEvent",
			"room": Meteor.userId(),
			"teamName": event.target.teamName.value,
			"studentName": event.target.studName.value,
			"affinities": affs,
			"visibility": vis
		}
		Meteor.call("addLog", eventLog);
		// Router.go("/");
	},

	'submit .addAffinity': function(event) {
		event.preventDefault();
		console.log("adding affinity");
		Meteor.call("addAffinity", Meteor.userId(), event.target.affinityName.value, event.target.faclass.value);
		eventLog = {
			"key": "addAffinityEvent",
			"room": Meteor.userId(),
			"affinityName": event.target.affinityName.value,
			"fontAwesomeClass": event.target.faclass.value
		}
		Meteor.call("addLog", eventLog);
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
		eventLog = {
			"key": "changeVisibleTeams",
			"room": Meteor.userId(),
			"visibleBoxes": checks,
		}
		Meteor.call("addLog", eventLog);
		// else {

		// }
		// Meteor.call("setDisplayBoxes", Meteor.userId(), event.target.teamName.value, event.target.studName.value, event.target.affinity.value);
		// Router.go("/");

	},

	'submit .changeTeamName': function(event) {
		event.preventDefault();
		Meteor.call("changeTeamName", Meteor.userId(), event.target.teamName.value, event.target.newTeamName.value);
		
	},

	'submit .locationSelector': function(event) {
		event.preventDefault();
		Meteor.call("setDisplaySpace", Meteor.userId(), event.target.location1.value, event.target.location2.value);
		Router.go("/");
	},

	'click .logOut': function () {
		// console.log("logging out?");
		logOutEvent = {
			"key": "logOutEvent",
			"room": Meteor.userId()
		}
		Meteor.call("addLog", logOutEvent);
		AccountsTemplates.logout();
		Router.go('/setLocation');
	}
});


