const sendEmail = require('./mailer').sendEmail
const template = require('./email-templates').creditApp

const items = [
    {
        "driverLicense": {
            "number": "213202411",
            "stateIssued": "NY",
            "expirationDate": "2020-10-17T00:00:00Z"
        },
        "employement": {
            "employerName": "New York Methodist Hospital",
            "employerAddress": "506 6th St, Brooklyn, NY 11215",
            "employerYearsAtWork": 3,
            "employerMonthsAtWork": null,
            "montlyIncome": 10000
        },
        "reviewed": false,
        "createdBy": "2018-05-01T16:26:37.247Z",
        "type": "credit",
        "reply": [],
        "deleted": false,
        "code": "ESTHER",
        "firstname": "SLIMA",
        "lastname": "KOUBEK",
        "middlename": "",
        "phoneNumber": "(516)732-1733",
        "dob": "1983-10-17T00:00:00Z",
        "ssn": "069682294",
        "email": "JOHN.KOUBEK@EXPEDITIRS.COM",
        "street": "166 GRAND BLVD",
        "city": "MASSAPEQUA PARK",
        "state": "NY",
        "zip": "11762",
        "homeOwnership": "OWN",
        "yearsLivingInPlace": null,
        "monthsLivingInPlace": 6,
        "monthlyRent": 3200,
        "previousAddress": "35 MELROSE AVE. LYNBROOK, NY, 11563",
        "previousEmployer": "",
        "__v": 0
    },
    {
        "driverLicense": {
            "number": "213202411",
            "stateIssued": "NY",
            "expirationDate": "2020-10-17T00:00:00Z"
        },
        "employement": {
            "employerName": "New York Methodist Hospital",
            "employerAddress": "506 6th St, Brooklyn, NY 11215",
            "employerYearsAtWork": 3,
            "employerMonthsAtWork": null,
            "montlyIncome": 10000
        },
        "reviewed": false,
        "createdBy": "2018-05-01T16:58:51.018Z",
        "type": "credit",
        "reply": [],
        "deleted": false,
        "code": "ESTHER",
        "firstname": "SLIMA",
        "lastname": "KOUBEK",
        "middlename": "",
        "phoneNumber": "(516) 732-1733",
        "dob": "1983-10-17T00:00:00Z",
        "ssn": "069682294",
        "email": "JOHN.KOUBEK@EXPEDITIRS.COM",
        "street": "166 GRAND BLVD",
        "city": "MASSAPEQUA PARK",
        "state": "NY",
        "zip": "11762",
        "homeOwnership": "OWN",
        "yearsLivingInPlace": null,
        "monthsLivingInPlace": 6,
        "monthlyRent": 3200,
        "previousAddress": "35 MELROSE AVE. LYNBROOK, NY, 11563",
        "previousEmployer": "",
        "__v": 0
    },
    {
        "driverLicense": {
            "number": "12345678",
            "stateIssued": "AL",
            "expirationDate": "2010-02-20T00:00:00Z"
        },
        "employement": {
            "employerName": "testing",
            "employerAddress": "",
            "employerYearsAtWork": null,
            "employerMonthsAtWork": null,
            "montlyIncome": 100000
        },
        "reviewed": true,
        "createdBy": "2018-05-01T17:41:08.925Z",
        "type": "credit",
        "reply": [],
        "deleted": false,
        "code": "test",
        "firstname": "test",
        "lastname": "test",
        "middlename": "test",
        "phoneNumber": "123456789",
        "dob": "2018-01-01T00:00:00Z",
        "ssn": "1234567",
        "email": "test@aol.com",
        "street": "125 test",
        "city": "test",
        "state": "AL",
        "zip": "11414",
        "homeOwnership": "RENT",
        "yearsLivingInPlace": 0,
        "monthsLivingInPlace": 0,
        "monthlyRent": 0,
        "previousAddress": "",
        "previousEmployer": "",
        "__v": 0,
        "reviewedBy": "2018-05-01T18:33:01.065Z"
    },
    {
        "driverLicense": {
            "number": "471309209",
            "stateIssued": "NY",
            "expirationDate": "2019-05-29T00:00:00Z"
        },
        "employement": {
            "employerName": "BOSTON COACH",
            "employerAddress": "19-1143RD STREET, ASTORIA NY, 11105",
            "employerYearsAtWork": 14,
            "employerMonthsAtWork": null,
            "montlyIncome": 7500
        },
        "reviewed": true,
        "createdBy": "2018-05-01T18:25:30.248Z",
        "type": "credit",
        "reply": [],
        "deleted": false,
        "code": "CHRIS",
        "firstname": "ALBELTO",
        "lastname": "MORALES",
        "middlename": "",
        "phoneNumber": "9173489161",
        "dob": "1960-05-29T00:00:00Z",
        "ssn": "123503516",
        "email": "BKLNAL529@AOL.COM",
        "street": "3101 AVENUE I APT 6-G",
        "city": "BROOKLYN",
        "state": "NY",
        "zip": "11210",
        "homeOwnership": "OTHER",
        "yearsLivingInPlace": 19,
        "monthsLivingInPlace": null,
        "monthlyRent": 0,
        "previousAddress": "",
        "previousEmployer": "",
        "__v": 0,
        "reviewedBy": "2018-05-01T18:35:46.626Z"
    },
    {
        "driverLicense": {
            "number": "756594575",
            "stateIssued": "NY",
            "expirationDate": "2026-02-14T00:00:00Z"
        },
        "employement": {
            "employerName": "Harbor fitness center",
            "employerAddress": "9215 4th ave ",
            "employerYearsAtWork": 3,
            "employerMonthsAtWork": 0,
            "montlyIncome": 3500
        },
        "reviewed": false,
        "createdBy": "2018-05-01T19:05:29.975Z",
        "type": "credit",
        "reply": [],
        "deleted": false,
        "code": "Ryan miley",
        "firstname": "Frank",
        "lastname": "Bergen",
        "middlename": "J",
        "phoneNumber": "3475677153",
        "dob": "1995-02-14T00:00:00Z",
        "ssn": "088841415",
        "email": "Frankbergen95@gmail.com",
        "street": "1859 76th st",
        "city": "Brooklyn",
        "state": "NY",
        "zip": "11214",
        "homeOwnership": "OTHER",
        "yearsLivingInPlace": null,
        "monthsLivingInPlace": null,
        "monthlyRent": 0,
        "previousAddress": "",
        "previousEmployer": "",
        "__v": 0
    }
]

function setData(data) {
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
    body['Previous Employer'] = data.previousEmployer || ''

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
