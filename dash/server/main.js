import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
	console.log(rests.findOne({}));
  // code to run on server at startup
});
