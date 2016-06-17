Router.route('/', function() {
	this.Member =  new ReactiveVar(0);
	this.render('home');
	Session.set("Member", 0);
});

Router.route('/member/:memid', function () {
	var memId = this.params.memid;
	Session.set("Member", memId);
	if (members.findOne({"MemberID": memId}) != undefined){
		Router.route('/actitout');
	}
	else {
		Router.route('/newMember');
	}
});

Router.route('/actitout', function () {
	if(Session.get("Member") != 0){
		this.render('activityEntry');
	}
	else {
		alert("You haven't tapped a card!");
		Router.go('/');
	}
});

Router.route('/newMember', function() {
	if(Session.get("Member") != 0){
		this.render('signUp');
	}
	else {
		alert("You haven't tapped a card!");
		Router.go('/');
	}
});