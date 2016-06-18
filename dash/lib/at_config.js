AccountsTemplates.configure({
	confirmPassword: false,
    overrideLoginErrors: false,
    lowercaseUsername: true,
    showForgotPasswordLink: true,
    homeRoutePath: '/'
});

if (Meteor.isServer){
    Meteor.methods({
        "userExists": function(username){
            return !!Meteor.users.findOne({username: username});
        },
    });
}

AccountsTemplates.addField({
    _id: 'username',
    type: 'text',
    displayName: "Location",
    required: true,
    func: function(value){
        if (Meteor.isClient) {
            console.log("Validating location...");
            var self = this;
            Meteor.call("userExists", value, function(err, userExists){
                if (!userExists)
                    self.setSuccess();
                else
                    self.setError(userExists);
                self.setValidating(false);
            });
            return;
        }
        // Server
        return Meteor.call("userExists", value);
    },
});

AccountsTemplates.configureRoute('signIn', {
  redirect: '/',
});

AccountsTemplates.configureRoute('signUp', {
  redirect: '/',
});