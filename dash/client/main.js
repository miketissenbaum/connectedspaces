import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
// import { members } from '../server/imports/collections.js';
// import { activities } from '../imports/collections.js';

Session.set("locationSet", true);
Session.set("refreshBox", true);
Session.set("peerId", 0);

Session.set("streamSettings", {audio: true, video: false});

// Session.set()
Meteor.subscribe('userPresence');
	
// window.peer = new Peer({
// 	key: peerKey,  // get a free key at http://peerjs.com/peerserver
// 	debug: 3,
// 	config: {'iceServers': [
// 		{ url: 'stun:stun.l.google.com:19302' },
// 		{ url: 'stun:stun1.l.google.com:19302' },
// 	]}
// });
// Session.set("peerId", peer.id);

// Presence.state = function() {
//   return {
//     peerId: Session.get("peerId"),
//     username: Meteor.user().username
//   };
// }

// Template.body.onCreated(function () {
// 	Presence.state = function() {
// 	  return {
// 	    peerId: Session.get("peerId"),
// 	    username: Meteor.user().username
// 	  };
// 	}

// 	p = new Peer({
// 		key: "rwcwolonbw8hyqfr",  // get a free key at http://peerjs.com/peerserver
// 		debug: 3,
// 		config: {'iceServers': [
// 			{ url: 'stun:stun.l.google.com:19302' },
// 			{ url: 'stun:stun1.l.google.com:19302' },
// 		]}
//     });
//     window.peer = p;
//     sock = p.socket;
//     console.log(sock);
// });

Template.eachBox.onCreated(function () {
	firstlocid = 0;
	firstloc = Meteor.users.findOne();
	if (firstloc != undefined){
		// console.log("defined");
		firstlocid = firstloc._id;
		// console.log(firstloc.username);
	}
	this.paneLocation = new ReactiveVar(firstlocid);
	Session.set("locationSet", true);
});

Template.eachBox.helpers({
	
	otherLocations: function () {
		return Meteor.users.find();
	},

	allData: function() {
		if (Session.get("locationSet") == true){
			Session.set("locationSet", false);
		}
		// console.log(Template.instance().paneLocation);
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
		key: "rwcwolonbw8hyqfr",  // get a free key at http://peerjs.com/peerserver
		debug: 3,
		config: {'iceServers': [
			{ url: 'stun:stun.l.google.com:19302' },
			{ url: 'stun:stun1.l.google.com:19302' },
		]}
    });
    // Session.set("peerId", peer.id);
	peer.on('open', function () {
		$('#myPeerId').text(peer.id);
		Session.set("peerId", peer.id);
		console.log(peer.id);
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

    // Session.set("peerId", peer.id);
    // console.log(peer.id);
    //Meteor.call("setPeerId", peer.id);
    
    Presence.state = function() {
	  return {
	    // currentRoomId: Session.get('currentRoomId'),
	    peerId: Session.get("peerId"),
	    room: Meteor.user().username
	  };
	}

	// var tempData = Template.currentData();
	// console.log(Template.currentData());

	// tempData.streamProps = {audio: true, video: true};
	// var streamProps = tempData[streamProps];
	navigator.getUserMedia = ( navigator.getUserMedia ||
	                        navigator.webkitGetUserMedia ||
	                        navigator.mozGetUserMedia ||
	                        navigator.msGetUserMedia );

	// get audio/video
	// console.log(Session.get("streamSettings"));
	navigator.getUserMedia(Session.get("streamSettings"), function (stream) {
	    //display video
		var video = document.getElementById("myVideo");
		video.src = URL.createObjectURL(stream);
		window.localStream = stream;
	},
	function (error) { 
		console.log(error); 
	});
	// console.log(peer);
	// console.log("peer " + peer.id);
	// Session.set("peerId", peer.id);

});

Template.videoChat.helpers({
	videoPeers: function () {
		//only chat with other locations signed in
		return Presences.find({$and: [{"state.peerId": {$ne: 0}}, {"userId": {$ne: Meteor.userId()}}]});

		//chat with other sign ins of same location as well
		// console.log("video chat" + Meteor.user());
		// return Presences.find({$and: [{"state.peerId": {$ne: 0}}, {"state.room": {$ne: Meteor.user().username}}]});

		// Session.set("peerId", peer.id);
		// console.log(peer);
		// console.log(Presences.find({}));
	},


});

Template.videoChat.events({
	"click .toggleStream": function (event) {
		console.log(event.target.id);
		feat = "video";
		var streamSettings = Session.get("streamSettings");
		streamSettings[feat] = !streamSettings[feat];
		Session.set("streamSettings", streamSettings);
		// get audio/video
		// console.log(Session.get("streamSettings"));
		navigator.getUserMedia(Session.get("streamSettings"), function (stream) {
		    //display video
			var video = document.getElementById("myVideo");
			video.src = URL.createObjectURL(stream);
			window.localStream = stream;
		},
		function (error) { 
			console.log(error); 
		});	
		// console.log(peer.id);
	},

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