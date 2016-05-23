"""
Continuously read.
"""

import serial
import re
import requests

ser = serial.Serial('/dev/tty.usbserial-AH02MAUE', 9600) # here you have to write your port. If you dont know how to find it just write ls -l /dev/tty.* in your terminal (i'm using mac)

def rfidResponse(responseID):
	# rID = responseID.strip();
	# print repr(responseID)
	print responseID
	# if responseID == "750047FB76BF":
	# 	print "This one"
	# 	payload = {"name":'Batman'}
	# 	print "Sending"
	# 	r = requests.post("http://127.0.0.1:5000/index", params=payload)
	# 	print(r.url)
	# else:
	# 	print "other one"
	payload = {"cardID":responseID}
	print payload
	r = requests.post("http://127.0.0.1:5000/index", data=payload)

while True:
	try:
		response = ser.readline()
		#stringResponse = str(response) # you don't need this line
		responseParse = re.search('[A-Z0-9]{12}(?=\s+)', response) #your NFC ID should be of fixed length
		if responseParse:
			rfidResponse(responseParse.group(0))
		else:
			print 'No NFC ID received'
	except KeyboardInterrupt:
		break

ser.close()
