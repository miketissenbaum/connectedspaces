Router.route('/', function() {
	// this.Member =  new ReactiveVar(0);
	this.render('home');
	Session.set("Member", "0");
	Session.set("Name", undefined);
	// Session.set("Name", undefined);
});

// Router.route('/member/:memid', function() {
// 	console.log(Meteor.subscribe("members"));
// 	this.wait(Meteor.subscribe("members"));
// 	console.log(this);
// 	if (this.ready()) {
// 		var memId = String(this.params.memid);
// 		console.log(String(memId));
// 		Session.set("Member", memId);
// 		console.log(members.findOne({"MemberID": memId}));
// 		if (members.findOne({"MemberID": memId}) != undefined){
// 			Router.go('/actitout');
// 		}
// 		else {
// 			Router.go('/newMember');
// 		}
// 	}
// 	else{
// 		this.render('loading');
// 		this.next()
// 	}
// });


Router.route('/member/:memid', function () {
	var memId = String(this.params.memid);
	// console.log(String(memId));
	Session.set("Member", memId);
	// console.log(members.findOne({"MemberID": memId}));
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

// Router.route('/member/:memid', function () {
// 	Session.set(String(this.params.memId));
// 	this.render("memberCheck");
// });


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
	// if (Session.get("Location") == undefined){
	// 	alert("The location for this system has been lost! Find the boss around and tell them to set")
	// }
	if(Session.get("Member") == "0" || Session.get("Member") == undefined){
		alert("You haven't tapped a card!");
		Router.go('/');		
	}
	else {
		this.render('signUp');
	}
});