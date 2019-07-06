'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);
            const values=[90,90,85,85,'rider1','driver1','vehicle1'];
            db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        it('should post a rides', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90,
                    'start_long': 90,
                    'end_lat': 85,
                    'end_long': 85,
                    'rider_name': 'rider1',
                    'driver_name': 'driver1',
                    'driver_vehicle': 'vehicle1'
                })
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) {
                      return done(err);
                    }
                    if (!('rideID' in res.body[0])) throw new Error("Ride Data Missing");
                    return done();
                  });
        });

        it('Should return VALIDATION_ERROR for start latitude and longitude', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 190,
                    'start_long': 90,
                    'end_lat': 85,
                    'end_long': 85,
                    'rider_name': 'rider1',
                    'driver_name': 'driver1',
                    'driver_vehicle': 'vehicle1'
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                }, done);
        });

        it('Should return VALIDATION_ERROR for end latitude and longitude', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90,
                    'start_long': 90,
                    'end_lat': 120,
                    'end_long': 130,
                    'rider_name': 'Rider Name',
                    'driver_name': 'Driver Name',
                    'driver_vehicle': 'Vehicle'
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                }, done);
        });

        it('should return empty rider name validation', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 0,
                    'start_long': 0,
                    'end_lat': 0,
                    'end_long': 0,
                    'rider_name': '',
                    'driver_name': 'Driver Name',
                    'driver_vehicle': 'Vehicle'
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Rider name must be a non empty string'
                }, done);
        });

        it('should return empty driver name validation', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 0,
                    'start_long': 0,
                    'end_lat': 0,
                    'end_long': 0,
                    'rider_name': 'Rider Name',
                    'driver_name': '',
                    'driver_vehicle': 'Vehicle'
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver name must be a non empty string'
                }, done);
        });

        it('should return empty vehicle validation', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 0,
                    'start_long': 0,
                    'end_lat': 0,
                    'end_long': 0,
                    'rider_name': 'Rider Name',
                    'driver_name': 'Driver Name',
                    'driver_vehicle': ''
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver Vehicle must be a non empty string'
                }, done);
        });
    });

    describe('GET /rides', () => {
        it('should return all rides', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) {
                      return done(err);
                    }
                    if (!('rideID' in res.body[1])) throw new Error("Ride Data Missing");
                    return done();
                  });
        });
    });

    describe('GET /rides/:id', () => {
        it('should return no rides available error', (done) => {
            request(app)
                .get('/rides/5')
                .expect('Content-Type', /json/)
                .expect(200, {
                    "error_code": "RIDES_NOT_FOUND_ERROR",
                    "message": "Could not find any rides"
                }, done);
        });

        it('should return rides', (done) => {
            request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                      return done(err);
                    }
                    if (!('rideID' in res.body[0])) throw new Error("Ride Data Missing");
                    return done();
                  });
        });

    });





});