Router.route('/', function() {
	Session.set("Member", "0");
	Session.set("Name", undefined);
	Session.set("User", Meteor.user());
	if(Meteor.userId() != undefined && smallGroups.find().fetch().length > 0) {
		// console.log(smallGroups.find().fetch());
		this.render('home');
	}
	else{
		this.render('loading');
	}
	console.log("home");
});

Router.route('/askHelp', function() {
	if (Meteor.userId() != undefined){
		this.render("askHelp");
	}
	else{
		this.render("loading");
	}
});

Router.route('/askHelp/:roomName', function() {
	var allRooms = ["maldenengg", "maldendesign"];
	var rName = String(this.params.roomName).toLowerCase();
	roomUser = Meteor.users.findOne({"username": rName});
	roomID = null;
	if (roomUser != null) {
		roomID = roomUser._id;
	}
	
	if (roomID != null) {
		Session.set("helpRoom", roomID);
		this.render("askHelp");
	}
	else {
		Session.set("helpRoom", null);
		this.render("loading");
	}
});

Router.route('/member/:memid', function () {
	var memId = String(this.params.memid);
	Session.set("Member", memId);
	this.subscribe('members', this.params.memId).wait();
	console.log(this.ready());
	if (this.ready()){
		Router.go('/memberCheck');
	}
	else{
		this.render("loading");
		this.next();
	}
});

Router.route('/memberCheck', function () {
	memId = Session.get("Member");
	console.log(members.findOne());
	if (members.findOne({"MemberID": memId}) != undefined){
		Router.go('/actitout');
	}
	else {
		Router.go('/newMember');
	}
})


Router.route('/setLocation/', function () {
	this.render("locationRegistration");
	if(Meteor.userId() != undefined) {
		this.render("locationSettings");
	}
});

Router.route('/actitout', function () {
	if(Session.get("Member") == "0" || Session.get("Member") == undefined){
		alert("You haven't tapped a card!");
		Router.go('/');
	}
	else {
		this.render('activityEntry');
	}
});

Router.route('/newMember', function() {
	if(Session.get("Member") == "0" || Session.get("Member") == undefined){
		alert("You haven't tapped a card!");
		Router.go('/');		
	}
	else {
		this.render('signUp');
	}
});

Router.route('/admin', function() {
	this.render("administration");
	if (Meteor.userId() == undefined) {
		this.render("locationRegistration");
	}
});