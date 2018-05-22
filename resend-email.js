const sendEmail = require('./mailer').sendEmail
const template = require('./email-templates').creditApp

const items = [
    {
        // "_id" : ObjectId("5aff455fb82bcc1bf2d6dcb1"),
        // "body" : {
        "code" : "esther",
        "firstname" : "luis",
        "lastname" : "llenas, jr.",
        "middlename" : "a",
        "dob" : "1976-02-03T00:00:00Z",
        "ssn" : "132684611",
        "street" : "302 dwight street",
        "city" : "waterbury",
        "state" : "ct",
        "zip" : "06704",
        "homeOwnership" : "RENT",
        "yearsLivingInPlace" : "12",
        "monthsLivingInPlace" : "6",
        "monthlyRent" : "0.00",
        "previousAddress" : "",
        "driverLicense" : {
            "number" : "148523845",
            "stateIssued" : "ct",
            "expirationDate" : "2020-02-03T00:00:00Z"
        },
        "employement" : {
            "employerName" : "nitro entertainment group",
            "employerAddress" : "95-36 75th street, ozone park, ny 11416",
            "employerContact" : "5164999760",
            "employerYearsAtWork" : "13",
            "employerMonthsAtWork" : "4",
            "jobTitle" : "general manager",
            "montlyIncome" : "7500.00"
        },
        "previousEmployer" : "",
        "agreed" : true,
        "reachedOut" : false,
        // },
        "phoneNumber" : "5167871674",
        "email" : "luisl76@gmail.com",
        "type" : "credit",
        "deleted" : false,
        "reply" : [ ],
        "reviewed" : false,
        "createdBy" : "2018-05-18T21:27:59.530Z",
        "__v" : 0
    },
    // {
    //     "driverLicense": {
    //         "number": "213202411",
    //         "stateIssued": "NY",
    //         "expirationDate": "2020-10-17T00:00:00Z"
    //     },
    //     "employement": {
    //         "employerName": "New York Methodist Hospital",
    //         "employerAddress": "506 6th St, Brooklyn, NY 11215",
    //         "employerYearsAtWork": 3,
    //         "employerMonthsAtWork": null,
    //         "montlyIncome": 10000
    //     },
    //     "reviewed": false,
    //     "createdBy": "2018-05-01T16:26:37.247Z",
    //     "type": "credit",
    //     "reply": [],
    //     "deleted": false,
    //     "code": "ESTHER",
    //     "firstname": "SLIMA",
    //     "lastname": "KOUBEK",
    //     "middlename": "",
    //     "phoneNumber": "(516)732-1733",
    //     "dob": "1983-10-17T00:00:00Z",
    //     "ssn": "069682294",
    //     "email": "JOHN.KOUBEK@EXPEDITIRS.COM",
    //     "street": "166 GRAND BLVD",
    //     "city": "MASSAPEQUA PARK",
    //     "state": "NY",
    //     "zip": "11762",
    //     "homeOwnership": "OWN",
    //     "yearsLivingInPlace": null,
    //     "monthsLivingInPlace": 6,
    //     "monthlyRent": 3200,
    //     "previousAddress": "35 MELROSE AVE. LYNBROOK, NY, 11563",
    //     "previousEmployer": "",
    //     "__v": 0
    // },
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
