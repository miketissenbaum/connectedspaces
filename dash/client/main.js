import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
// import { members } from '../server/imports/collections.js';
// import { activities } from '../imports/collections.js';

Session.set("locationSet", true);
Session.set("refreshBox", true);
// Session.set()

Template.eachBox.onCreated(function () {
	firstlocid = 0;
	firstloc = Meteor.users.findOne();
	if (firstloc != undefined){
		console.log("defined");
		firstlocid = firstloc._id;
		console.log(firstloc.username);
	}
	this.paneLocation = new ReactiveVar(firstlocid);
	Session.set("locationSet", true);
});

Template.eachBox.helpers({
	
	otherLocations: function () {
		return Meteor.users.find();
		// Session.set("boxDefault", {"change": true, "id": Meteor.users.findOne()._id});
	},

	allData: function() {
		if (Session.get("locationSet") == true){
			// console.log("in alldata " + Template.instance().paneLocation + " " + this.paneLocation);
			// locationName = Meteor.users.findOne({_id: this.location})
			// Session.set("refreshBox", false);
			// return activities.find({$and: [{locationID: Template.instance().paneLocation}, {Status: "in"}]}).fetch();
			Session.set("locationSet", false);
			// console.log(activities.find({$and: [{locationID: Template.instance().paneLocation}, {Status: "in"}]}).fetch());
			// return activities.find({$and: [{locationID: Template.instance().paneLocation}, {Status: "in"}]}).fetch();
		}
		console.log(Template.instance().paneLocation);
		if (Template.instance().paneLocation != 0){
			return activities.find({$and: [{locationID: Template.instance().paneLocation}, {Status: "in"}]}).fetch();
		}
		else {
			return activities.find({$and: [{locationID: Meteor.users.findOne()._id}, {Status: "in"}]}).fetch();
		}
	}
});

Template.eachBox.events({
	"change .locationSelector": function (event) {
		event.preventDefault();
		// a = event;
		Template.instance().paneLocation = event.currentTarget.location.value;
		// Template.instance().paneLocation2 = event.currentTarget.location2.value;
		// console.log("in change form thing " + Template.instance().paneLocation);
		Session.set("locationSet", true);
	}
});

Template.activityEntry.helpers({
	name() {
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
		Meteor.call("logActivity", Session.get("Member"), Session.get("Name"), event.target.activity.value, Meteor.userId(), Meteor.user().username, function (err, res){
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
		Meteor.call("createMember", Session.get("Member"), event.target.name.value, event.target.zipcode.value, function (err, res) {
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

Template.videoChat.onCreated(function () {
	window.peer = new Peer({
		key: peerKey,  // get a free key at http://peerjs.com/peerserver
		debug: 3,
		config: {'iceServers': [
			{ url: 'stun:stun.l.google.com:19302' },
			{ url: 'stun:stun1.l.google.com:19302' },
		]}
    });
	peer.on('open', function () {
		$('#myPeerId').text(peer.id);
	});

    // Handle event: remote peer receives a call
    peer.on('call', function (incomingCall) {
		window.currentCall = incomingCall;
		incomingCall.answer(window.localStream);
		incomingCall.on('stream', function (remoteStream) {
			window.remoteStream = remoteStream;
			var video = document.getElementById("theirVideo")
			video.src = URL.createObjectURL(remoteStream);
		});
    });

    navigator.getUserMedia = ( navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia );

    // get audio/video
    navigator.getUserMedia({audio:true, video: true}, function (stream) {
        //display video
        var video = document.getElementById("myVideo");
      video.src = URL.createObjectURL(stream);
        window.localStream = stream;
      },
      function (error) { console.log(error); }
    );
});

Template.videoChat.events({
    "click #makeCall": function () {
      var outgoingCall = peer.call($('#remotePeerId').val(), window.localStream);
      window.currentCall = outgoingCall;
      outgoingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        var video = document.getElementById("theirVideo")
        video.src = URL.createObjectURL(remoteStream);
      });
    },

    "click #endCall": function () {
      window.currentCall.close();
    }
});