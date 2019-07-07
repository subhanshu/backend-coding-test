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
      const values = [90, 90, 85, 85, 'rider1', 'driver1', 'vehicle1'];
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);

      done();
    
    });
  
  });

  //Testing Health
  describe('GET /health', () => {

    it('should return health', (done) => {

      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    
    });
  
  });

  //Testing post rides
  describe('POST /rides', () => {
    it('Should insert a ride in database', (done) => {
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
                if (!('rideID' in res.body[0])) throw new Error("Ride Insert Failed");
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
                'end_lat': 115,
                'end_long': 140,
                'rider_name': 'rider1',
                'driver_name': 'driver1',
                'driver_vehicle': 'vehicle1'
            })
            .expect('Content-Type', /json/)
            .expect(200, {
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            }, done);
    });

    it('Should return VALIDATION_ERROR for empty rider name', (done) => {
        request(app)
            .post('/rides')
            .send({
                'start_lat': 90,
                'start_long': 90,
                'end_lat': 85,
                'end_long': 85,
                'rider_name': '',
                'driver_name': 'driver1',
                'driver_vehicle': 'vehicle1'
            })
            .expect('Content-Type', /json/)
            .expect(200, {
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            }, done);
    });

    it('Should return VALIDATION_ERROR for empty driver name', (done) => {
        request(app)
            .post('/rides')
            .send({
                'start_lat': 90,
                'start_long': 90,
                'end_lat': 85,
                'end_long': 85,
                'rider_name': 'rider1',
                'driver_name': '',
                'driver_vehicle': 'vehicle1'
            })
            .expect('Content-Type', /json/)
            .expect(200, {
                error_code: 'VALIDATION_ERROR',
                message: 'Driver name must be a non empty string'
            }, done);
    });

    it('Should return VALIDATION_ERROR for empty vehicle plate', (done) => {
        request(app)
            .post('/rides')
            .send({
                'start_lat': 90,
                'start_long': 90,
                'end_lat': 85,
                'end_long': 85,
                'rider_name': 'rider1',
                'driver_name': 'driver1',
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
    it('Should return all rides as array from the database', (done) => {
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
    //Tests for pagination
    it('Should return 5 rides from database', (done) => {
        request(app)
            .get('/rides')
            .query({ page_no: 1, page_size: 5 })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                if (!(res.body.length==5)) throw new Error("Incorrect Page Size");
                if (!(res.body[0].rideID==1)) throw new Error("Ride does not match");
                return done(err);
            });
    });

    //Tests for pagination with invalid values

    it('Should return RIDES_NOT_FOUND_ERROR rides from database', (done) => {
        request(app)
            .get('/rides')
            .query({ page_no: 100, page_size: 5 })
            .expect('Content-Type', /json/)
            .expect(200,{
                error_code: 'RIDES_NOT_FOUND_ERROR',
                message: 'Could not find any rides'
              }, done);
    });

    it('Should return SERVER_ERROR if page size is missing', (done) => {
        request(app)
            .get('/rides')
            .query({ page_no: 1 })
            .expect('Content-Type', /json/)
            .expect(200,{
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
              }, done);
    });

    it('Should return SERVER_ERROR if page no is missing', (done) => {
        request(app)
            .get('/rides')
            .query({ page_size: 1 })
            .expect('Content-Type', /json/)
            .expect(200,{
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
              }, done);
    });

    it('Should return SERVER_ERROR if invalid values are there', (done) => {
        request(app)
            .get('/rides')
            .query({ page_size: 'x', page_no:1 })
            .expect('Content-Type', /json/)
            .expect(200,{
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
              }, done);
    });
});

//Testing GET Rides
describe('GET /rides/:id', () => {
    it('Should return RIDES_NOT_FOUND_ERROR if no ride exists with that id', (done) => {
        request(app)
            .get('/rides/45')
            .expect('Content-Type', /json/)
            .expect(200, {msg:{
                "error_code": "RIDES_NOT_FOUND_ERROR",
                "message": "Could not find any rides"
            }}, done);
    });

    it('Should return the ride specific to the given ID', (done) => {
        request(app)
            .get('/rides/1')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                if (!('rideID' in res.body[0])) throw new Error("Ride Data Missing");
                if (!(res.body[0].rideID==1)) throw new Error("Ride does not match");
                return done();
            });
    });

});

describe('POST /rides on closed DB', () => {
it('Should return SERVER_ERROR', (done) => {
    db.close();
    request(app)
        .post('/rides')
        .send({
            'start_lat': 90,
            'start_long': 90,
            'end_lat': 85,
            'end_long': 85,
            'rider_name': 'rider1',
            'driver_name': 'driver1',
            'driver_vehicle': 'vehicle1',
        })
        .expect('Content-Type', /json/)
        .expect(200, {
            error_code: 'SERVER_ERROR',
            message: 'Unknown error'
          }, done);
});

});
 
});