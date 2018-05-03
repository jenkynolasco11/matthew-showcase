const mongoose = require('mongoose');
const Submission = require('./models').Submission;
const CreditApp = require('./models').CreditApp;
const SellCar = require('./models').SellCar;
const Message = require('./models').Message;



function createNewSubmissionMessage (messageData) {
    const migratedMessage = new Submission({
        name: `${messageData.name}`,
        type: 'message',
        message: messageData.message,
        email: messageData.email,
        reply: messageData.reply,
        createdBy: messageData.createdBy,
        reviewed: messageData.reviewed,
        body: { subject: messageData.subject }
    })

    migratedMessage.save((err, doc) => {
        if (err) console.log(err);
        
        console.log(`SUCCESS: Migrated Message from ${doc.name}`);
    });
}


function createNewSubmissionFromCreditApp (credApplication) {
    const migratedApplication = new Submission({
        name: `${credApplication.firstname} ${credApplication.middlename ? credApplication.middlename : ''} ${credApplication.lastname}`,
        firstName: credApplication.firstname,
        lastName: credApplication.lastname,
        phoneNumber: credApplication.phoneNumber,
        type: 'credit',    
        email: credApplication.email,
        reply: credApplication.reply,
        createdBy: credApplication.createdBy,
        reviewed: credApplication.reviewed,
        body: { ...credApplication }
    })

    migratedApplication.save((err, doc) => {
        if (err) console.log(err);
        console.log(`SUCCESS: Migrated application from ${doc.name}`);
    });
    
}


function createNewSubmissionFromSell (selledCar) {
    const migratedSellCar = new Submission({
        name: `${selledCar.firstname} ${selledCar.middlename ? selledCar.middlename : ''} ${selledCar.lastname}`,
        firstName: selledCar.firstname,
        lastName: selledCar.lastname,
        phoneNumber: selledCar.phoneNumber,
        type: 'sell',    
        email: selledCar.email,
        reply: selledCar.reply,
        createdBy: selledCar.createdBy,
        reviewed: selledCar.reviewed,
        body: { ...selledCar }
    })

    migratedSellCar.save((err, doc) => {
        if (err) console.log(err);
        
        console.log(`SUCCESS: Migrated ${doc.body.make.toUpperCase()} ${doc.body.vin}`);
    });
}

async function performMigration () {

    mongoose.connect('mongodb://127.0.0.1/jydautoleasing', async err => {
        console.log('MIGRATE: SELLING CAR');

        try {
            const selledCars = await SellCar.find({});
            const creditApps = await CreditApp.find({});
            const messages = await Message.find({});
            // selledCars.forEach(selledCar => createNewSubmissionFromSell(selledCar.toObject()));
            // creditApps.forEach(creditApp => createNewSubmissionFromCreditApp(creditApp.toObject()));
            messages.forEach(message => createNewSubmissionMessage(message))

        } catch (error) {
            console.error(error);
        }
    });
};

performMigration();