const csvFilePath = './CQA_Premium.csv'
const csv = require('csvtojson');
const ReferenceCar = require('./models/car').ReferenceCar;
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/jydautoleasing', err => {

    if (err) throw err;

    let count = 0;

    csv()
    .fromFile(csvFilePath)
    .on('json', jsonObj => {
    
        const mileConverter = function (kph) {
    
            if (!isNaN(kph)) {
                return Math.ceil(parseInt(kph) / 1.60934);
            }
            return 'NULL';
        }
    
        const lkmtoMPG = function (klm) {
            if (!isNaN(klm)) {
                return Math.ceil(parseFloat(klm) * 2.824809363);
            }
    
            return 'NULL';
        }
    
        const litersToGallon = function (liters) {
            if (!isNaN(liters)) {
                return Math.ceil(parseInt(liters) * 0.264172);
            }
    
            return 'NULL';
        }
    
        const soldInUS = function (booleanvalue) {
            return  parseInt(booleanvalue) > 0;
        }
    
        const newCarReference = new ReferenceCar({
            modelId: jsonObj.model_id,
            modelMakeId: jsonObj.model_make_id,
            model: jsonObj.model_name,
            modelTrim: jsonObj.model_trim,
            modelYear: jsonObj.model_year,
            modelBody: jsonObj.model_body,
            modelEnginePosition: jsonObj.model_engine_position,
            modelEngineCC: jsonObj.model_engine_cc,
            modelEngineCyl: jsonObj.model_engine_cyl,
            modelEngineType: jsonObj.model_engine_type,
            modelEngineValvesPerCyl: jsonObj.model_engine_valves_per_cyl,
            modelEnginePowerPs: jsonObj.model_engine_power_ps,
            modelEnginePowerRPM: jsonObj.model_engine_power_rpm,
            modelEngineTorqueNm: jsonObj.model_engine_torque_nm,
            modelEngineTorqueRPM: jsonObj.model_engine_torque_rpm,
            modelEngineBoreMM: jsonObj.model_engine_bore_mm,
            modelEngineStroke_mm: jsonObj.model_engine_stroke_mm,
            modelEngineCompression: jsonObj.model_engine_compression,
            modelEngineFuel: jsonObj.model_engine_fuel,
            modelTopSpeedKPH: jsonObj.model_top_speed_kph,
            modelTopSpeedMPH: mileConverter(jsonObj.model_top_speed_kph),
            modelAcceleration0To60: jsonObj.model_0_to_100_kph,
            modelDrive: jsonObj.model_drive,
            modelTransmission_type: jsonObj.model_transmission_type,
            modelSeats: jsonObj.model_seats,
            modelDoors: jsonObj.model_doors,
            modelWeightKG: jsonObj.model_weight_kg,
            modelLengthMM: jsonObj.model_length_mm,
            modelWidthMM: jsonObj.model_width_mm,
            modelHeightMM: jsonObj.model_height_mm,
            modelWheelbaseMM: jsonObj.model_wheelbase_mm,
            modelLkmHwy: lkmtoMPG(jsonObj.model_lkm_city),
            modelLkmMixed: lkmtoMPG(jsonObj.model_lkm_mixed),
            modelLkmCity: lkmtoMPG(jsonObj.model_lkm_city),
            modelFuelCapM: litersToGallon(jsonObj.model_fuel_cap_l),
            modelSoldInUS:  soldInUS(jsonObj.model_sold_in_us),
            modelCO2: jsonObj.model_co2,
            modelMakeDisplay: jsonObj.model_make_display
        });

        newCarReference.save((err, doc) => {
            console.log(`Car successuflly saved: ${doc.modelMakeDisplay} ${doc.model} ${doc.modelTrim}`);
            count++;
        });
    })
    .on('done', () => {
        console.log(`Succesfully saved ${count} vehicles.`);
        process.exit(0);
    });
});