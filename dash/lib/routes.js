Router.route('/', function() {
	Session.set("Member", "0");
	Session.set("Name", undefined);
	this.render('home');
	console.log("home");
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