from datetime import datetime
from flask import render_template, flash
from flask import Flask, request, jsonify, session, redirect, url_for
from flask.ext.mongokit import MongoKit, Document
import requests


# from app import app
import requests

app = Flask(__name__)

app.secret_key = 'you-will-never-guess'
app.config['SESSION_TYPE'] = 'filesystem'

checkCheck = False
isMember = False

member_name = ""
member_ID = ""
location = "Room 150"

class Members(Document):
	__collection__ = 'members'
	structure = {
		'name': unicode,
		'currentActivity': unicode,
		'MemberID': unicode,
		'ZipCode': unicode,
		'created_at': datetime,
	}
	required_fields = ['name']
	default_values = {'created_at': datetime.utcnow}
	use_dot_notation = True

class Activities(Document):
	__collection__ = 'activities'
	structure = {
		'name': unicode,
		'currentActivity': unicode,
		'MemberID': unicode,
		'location': unicode,
		'loggedIn': datetime,
	}
	default_values = {'loggedIn': datetime.utcnow}
	use_dot_notation = True

db = MongoKit(app)
db.register([Members])
db.register([Activities])


@app.route('/getSignIn', methods=['GET','POST'])
def getSignIn():
	print checkCheck
	global checkCheck
	global member_name
	global member_ID
	if(checkCheck == True):
		print "Sending confirmation for check in";
	list = {'newCheckin': checkCheck, 'isMember' : isMember,'member_ID' : member_ID, 'name' : member_name}
	checkCheck = False
	return jsonify(list)


@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def check_in():
	if request.method == 'POST':
		# global location
		global member_ID
		global checkCheck
		checkCheck = True
		member_ID = request.form['cardID']
		print member_ID
		if db.Members.find({'MemberID': {"$exact": member_ID}}):
			print "existing member"
			flash('Account already exists for ' +member_name +' memberID: ' +member_ID)
			return redirect(url_for('activity'))
		else:
			print "new member"
			return redirect(url_for('sign_up'))
	return render_template('index.html')



@app.route('/signup', methods=["GET", "POST"])
def sign_up():
	if request.method == 'POST':
		global member_name
		global member_ID
		member = db.Members()
		member_name = request.form['name']
		member.name = member_name
		member.ZipCode = request.form['ZipCode']
		member.MemberID = member_ID.decode('utf-8')

		# Need to figure this out doesn't write to db if this is in

		# if db.Members.find({'MemberID': {"$eq": member_ID}}):
		# 	print member_ID
		# 	flash('Account already exists for ' +member_name +' memberID: ' +member_ID)
		# 	return redirect(url_for('activity'))

		# end of error 
			
		member.save()
		flash('Account created for ' +member_name +' memberID: ' +member_ID)
		return redirect(url_for('activity'))
	return render_template('signup.html')

@app.route('/select_activity', methods=["GET", "POST"])
def activity():
	if request.method == 'POST':
		global member_name
		global member_ID
		global location
		activity = db.Activities()
		activity.currentActivity = request.form['activity'].decode('utf-8')
		activity.name = member_name.decode('utf-8')
		activity.MemberID = member_ID.decode('utf-8')
		activity.location = location.decode('utf-8')
		activity.save()
		flash('Activity saved for ' +activity.name +" with activity " +activity.currentActivity +" at "+location)
		return redirect(url_for('check_in'))
	return render_template('select_activity.html')


if __name__ == "__main__":
	app.run(debug=True)

