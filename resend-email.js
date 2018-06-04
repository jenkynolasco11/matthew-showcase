const sendEmail = require('./mailer').sendEmail
const template = require('./email-templates').creditApp

const items = [
    {
        "phoneNumber" : "3476349051",
	    "email" : "cookingmom64@aol.com",
		"code" : "gabriel",
		"firstname" : "vincenza",
		"lastname" : "puccio",
		"middlename" : "vitale",
		"dob" : "1964-05-23T00:00:00Z",
		"ssn" : "082640870",
		"street" : "2995 clubhouse road ",
		"city" : "merrick",
		"state" : "ny",
		"zip" : "11566",
		"homeOwnership" : "OWN",
		"yearsLivingInPlace" : "22",
		"monthsLivingInPlace" : "",
		"monthlyRent" : "0.00",
		"previousAddress" : "",
		"driverLicense" : {
			"number" : "439167435",
			"stateIssued" : "ny",
			"expirationDate" : "2019-05-23T00:00:00Z"
		},
		"employement" : {
			"employerName" : "first national bank ",
			"employerAddress" : "159-14 crossbay blvd ",
			"employerContact" : "7188351962",
			"employerYearsAtWork" : "3",
			"employerMonthsAtWork" : "",
			"jobTitle" : "asst branch manager",
			"montlyIncome" : "5500"
		},
		"previousEmployer" : "",
		"agreed" : true,
		"reachedOut" : false
    },
    {
        "phoneNumber" : "7186832526",
        "email" : "ehoff@gmail.com",
		"code" : "angelo",
		"firstname" : "edward ",
		"lastname" : "hoff",
		"middlename" : "t",
		"dob" : "1995-12-08T00:00:00Z",
		"ssn" : "125840277",
		"street" : "10227 davenport court ",
		"city" : "howard beach ",
		"state" : "ny",
		"zip" : "11414",
		"homeOwnership" : "RENT",
		"yearsLivingInPlace" : "23",
		"monthsLivingInPlace" : "0",
		"monthlyRent" : "0.00",
		"previousAddress" : "",
		"driverLicense" : {
			"number" : "350463118",
			"stateIssued" : "ny",
			"expirationDate" : "2018-12-08T00:00:00Z"
		},
		"employement" : {
			"employerName" : "upright fire protection",
			"employerAddress" : "200 blydenburgh road, islandia, ny 11719",
			"employerContact" : "6312050330",
			"employerYearsAtWork" : "3",
			"employerMonthsAtWork" : "0",
			"jobTitle" : "fire  safety inspector",
			"montlyIncome" : "5000"
		},
		"previousEmployer" : "",
		"agreed" : true,
		"reachedOut" : false
	}
    /*
        // {
        //     "type": "Credit App",
        //     "Salesman's Name": "angelo",
        //     "First Name": "Edward ",
        //     "Last Name": "Hoff",
        //     "Middle Name": "T",
        //     "DOB Month": "12",
        //     "DOB Day": "8",
        //     "DOB Year": "1995",
        //     "SSN": "125840277",
        //     "Day Time Phone": "7186832526",
        //     "email": "ehoff@gmail.com",
        //     "Address": "10227 Davenport Court ",
        //     "City": "Howard Beach ",
        //     "State": "NY",
        //     "ZIP Code": "11414",
        //     "Home Type": "Rent",
        //     "Years Living There": "23",
        //     "Months Living There": "0",
        //     "Previous Address": "",
        //     "Monthly Payment": "0.00",
        //     "Driver's Licence Number": "350463118",
        //     "Driver's State": "NY",
        //     "Driver's License Expiration Date Month": "12",
        //     "Driver's License Expiration Date Day": "8",
        //     "Driver's License Expiration Date Year": "2018",
        //     "Employer's Name": "Upright Fire Protection",
        //     "Employer's Phone": "6312050330",
        //     "Job Title": "Fire  Safety Inspector",
        //     "Employer's Address": "200 Blydenburgh Road, Islandia, NY 11719",
        //     "Employee Years": "3",
        //     "Employee Months": "0",
        //     "Previous Employer": "",
        //     "Monthly Income": "5000",
        //     "agree": "1"
        // },
        // {
        //     "type": "Credit App",
        //     "Salesman's Name": "Gabriel",
        //     "First Name": "Vincenza ",
        //     "Last Name": "Vitale-Puccio ",
        //     "Middle Name": "",
        //     "DOB Month": "5",
        //     "DOB Day": "23",
        //     "DOB Year": "1964",
        //     "SSN": "082640870",
        //     "Day Time Phone": "3476349051",
        //     "email": "Cookingmom64 @aol.com",
        //     "Address": "2995 clubhouse road ",
        //     "City": "Merrick",
        //     "State": "NY",
        //     "ZIP Code": "11566",
        //     "Home Type": "Own",
        //     "Years Living There": "22",
        //     "Months Living There": "",
        //     "Previous Address": "160-23 83 st",
        //     "Monthly Payment": "0",
        //     "Driver's Licence Number": "439167435",
        //     "Driver's State": "NY",
        //     "Driver's License Expiration Date Month": "5",
        //     "Driver's License Expiration Date Day": "23",
        //     "Driver's License Expiration Date Year": "2019",
        //     "Employer's Name": "FNBLI ",
        //     "Employer's Phone": "7188351962",
        //     "Job Title": "Asst branch manager ",
        //     "Employer's Address": "159-14 crossbay Blvd hb ny",
        //     "Employee Years": "3",
        //     "Employee Months": "",
        //     "Previous Employer": "",
        //     "Monthly Income": "3500",
        //     "agree": "1"
        // }, {
        //     "type": "Credit App",
        //     "Salesman's Name": "CHRIS",
        //     "First Name": "DAVID ",
        //     "Last Name": "GUTHRIE",
        //     "Middle Name": "J",
        //     "DOB Month": "11",
        //     "DOB Day": "18",
        //     "DOB Year": "1993",
        //     "SSN": "094828445",
        //     "Day Time Phone": "3472725453",
        //     "email": "JTRED8641@AOL.COM",
        //     "Address": "98-32 57TH AVENUE APT 6 O",
        //     "City": "CORONA",
        //     "State": "NY",
        //     "ZIP Code": "11368",
        //     "Home Type": "Rent",
        //     "Years Living There": "4",
        //     "Months Living There": "",
        //     "Previous Address": "",
        //     "Monthly Payment": "1444.00",
        //     "Driver's Licence Number": "670614765",
        //     "Driver's State": "NY",
        //     "Driver's License Expiration Date Month": "11",
        //     "Driver's License Expiration Date Day": "18",
        //     "Driver's License Expiration Date Year": "2021",
        //     "Employer's Name": "CIPRIANI RESTAURANT",
        //     "Employer's Phone": "2123430999",
        //     "Job Title": "CHEF",
        //     "Employer's Address": "367 W BROADWAY, NEW YORK NY, 10012",
        //     "Employee Years": "2",
        //     "Employee Months": "",
        //     "Previous Employer": "",
        //     "Monthly Income": "3400.00",
        //     "agree": "1"
        // }, {
        //     "type": "Credit App",
        //     "Salesman's Name": "Frank C.",
        //     "First Name": "Vincent ",
        //     "Last Name": "Calabro",
        //     "Middle Name": "P",
        //     "DOB Month": "3",
        //     "DOB Day": "10",
        //     "DOB Year": "1957",
        //     "SSN": "112524939",
        //     "Day Time Phone": "5167286952",
        //     "email": "captvinniekac@aol.com",
        //     "Address": "164-32 95th st",
        //     "City": "Howard Beach",
        //     "State": "NY",
        //     "ZIP Code": "11414",
        //     "Home Type": "Own",
        //     "Years Living There": "2",
        //     "Months Living There": "0",
        //     "Previous Address": "",
        //     "Monthly Payment": "1200",
        //     "Driver's Licence Number": "193111313",
        //     "Driver's State": "NY",
        //     "Driver's License Expiration Date Month": "3",
        //     "Driver's License Expiration Date Day": "10",
        //     "Driver's License Expiration Date Year": "2019",
        //     "Employer's Name": "NYC Police Corrections",
        //     "Employer's Phone": "6466105000",
        //     "Job Title": "Officer",
        //     "Employer's Address": "7901 Broadway",
        //     "Employee Years": "13",
        //     "Employee Months": "0",
        //     "Previous Employer": "",
        //     "Monthly Income": "8500",
        //     "agree": "1"
        // }
    */
]

function setData(data) {
    console.log(data)
    const body = {}

    body['Salesman\'s Name'] = data.code || ''
    body['First Name'] = data.firstname || ''
    body['Last Name'] = data.lastname || ''
    body['Middle Name'] = data.middlename || ''
    body['Day Time Phone'] = data.phoneNumber || ''
    body['SSN'] = data.ssn || ''
    body['email'] = data.email || ''
    body['Address'] = data.street || ''
    body['City'] = data.city || ''
    body['State'] = data.state || ''
    body['ZIP Code'] = data.zip || ''
    body['Home Type'] = data.homeOwnership.toLowerCase() || ''
    body['Years Living There'] = data.yearsLivingInPlace || ''
    body['Months Living There'] = data.monthsLivingInPlace || ''
    body['Monthly Payment'] = '' + data.monthlyRent  || ''
    body['Previous Address'] = data.previousAddress || ''
    body['Driver\'s Licence Number'] = data.driverLicense.number || ''
    body['Driver\'s State'] = data.driverLicense.stateIssued || ''

    const expDate = new Date(data.driverLicense.expirationDate)

    body['Driver\'s License Expiration Date Year'] = ('' + expDate.getFullYear()) || ''
    body['Driver\'s License Expiration Date Day'] = ('' + expDate.getDay()) || ''
    body['Driver\'s License Expiration Date Month'] = ('' + (expDate.getMonth() + 1)) || ''
    body['Employer\'s Name'] = data.employement.employerName || ''
    body['Employer\'s Address'] = data.employement.employerAddress || ''
    body['Employee Years'] = data.employement.employerYearsAtWork || ''
    body['Employee Months'] = data.employement.employerMonthsAtWork || ''
    body['Monthly Income'] = '' + data.employement.montlyIncome || ''
    body['Job Title'] = '' + data.employement.jobTitle || ''
    body['Previous Employer'] = '' + data.previousEmployer || ''
    body['Employer\'s Phone'] = '' + data.employement.employerContact || ''

    const dob = new Date(data.dob)

    body['DOB Year'] = ('' + dob.getFullYear()) || ''
    body['DOB Day'] = ('' + dob.getDate()) || ''
    body['DOB Month'] = ('' + (dob.getMonth() + 1)) || ''

    body.agree = true

    const name = data.firstname + ' ' + data.lastname

    console.log(body)

    const emailBody = {
        to : 'jenky@leadfire.com',
        bcc : 'jenky@leadfire.com',
        from : `'${ name }' <${ data.email }>`,
        html : template(body),
        subject : `Credit App - ${ name }`
    }

    sendEmail(emailBody, err => {
        if(err) return console.log(err)

        console.log('Email sent...')
    })
}

items.forEach(setData)
