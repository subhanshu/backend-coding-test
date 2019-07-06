'use strict';

const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerDef = require('../swaggerDef');

const swaggerSpec = swaggerJSDoc(swaggerDef);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {

    /**
     * @swagger
     *
     * /health:
     *   get:
     *     tags:
     *        - Server
     *     name: Health Check
     *     summary: Use this endpoint for health check on server
     *     description: Use this API call to get the health of the system. It provides an easy way to determine if the API server is working fine
     *     produces:
     *       - application/text
     *     responses:
     *       200:
     *         description: Responds with the text 'Healthy'
     *       500:
     *          description: Server Error, Need to check server
     */
    app.get('/health', (req, res) => res.send('Healthy'));

    /**
    * @swagger
    * /rides:
    *   post:
    *     tags:
    *       - Rides
    *     name: Create new rides
    *     summary: Use this endpoint to create rides
    *     description: The purpose of this API is to provide a user with a method to create a ride based on start location, end location, Rider Name, Driver Name and Vehicle details
    *     consumes:
    *       - application/json
    *     parameters:
    *       - name: body
    *         in: body
    *         schema:
    *           type: object
    *           properties:
    *             start_lat:
    *               type: integer
    *               required: true
    *               description: Latitude for the starting point of the ride
    *               example: 85
    *             start_long:
    *               type: integer
    *               required: true
    *               description: Longitude for the starting point of the ride
    *               example: 95
    *             end_lat:
    *               type: integer
    *               required: true
    *               description: Latitude for the end point of the ride
    *               example: 86
    *             end_long:
    *               type: integer
    *               required: true
    *               description: Longitude for the end point of the ride
    *               example: 96
    *             rider_name:
    *               type: string
    *               required: true
    *               description: Name of the person taking or booking the ride
    *               example: subhanshu
    *             driver_name:
    *               type: string
    *               required: true
    *               description: Name of the driver for the ride
    *               example: driver 2
    *             driver_vehicle:
    *               type: string
    *               required: true
    *               description: Plate number for the vehicle being used for the ride
    *               example: vehicle 4
    *     responses:
    *       200:
    *           description: "Returns this code when Ride is created succesfully and returns the ride. In case of validation errors, Error Message is shown {error_code: 'VALIDATION_ERROR', message: 'message'}"
    *           schema:
    *               type: object
    *               properties:
    *                       rideID:
    *                           type: integer
    *                           description: Id of the ride created using the request
    *                       startLat:
    *                           type: integer
    *                           description: Latitude of the start location of the ride created using the request
    *                       startLong:
    *                           type: integer
    *                           description: Longitude of the start location of the ride created using the request
    *                       endLat:
    *                           type: integer
    *                           description: Latitude of the end location of the ride created using the request
    *                       endLong:
    *                           type: integer
    *                           description: Longitude of the end location of the ride created using the request
    *                       riderName:
    *                           type: string
    *                           description: Name of the rider for the ride created using the request
    *                       driverName:
    *                           type: string
    *                           description: Name of the driver for the ride created using the request
    *                       driverVehicle:
    *                           type: string
    *                           description: Plate number of the vehicle of the ride created using the request
    *                       created:
    *                           type: string
    *                           description: Date and time of the ride created using the request
    *       500:
    *          description: Server Error, Need to check server
    */
    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string:'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });

    /**
    * @swagger
    *
    * /rides:
    *   get:
    *     tags:
    *        - Rides
    *     name: Get Rides
    *     summary: Get a list of rides
    *     description: Use this API call to get all the rides in the system
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *           description: "Returns an array of all rides in the system. In case of validation errors, Error Message is shown {error_code: 'VALIDATION_ERROR', message: 'message'}"
    *           schema:
    *               type: array
    *               items:
    *                   properties:
    *                       rideID:
    *                           type: integer
    *                           description: Id of the ride created using the request
    *                       startLat:
    *                           type: integer
    *                           description: Latitude of the start location of the ride created using the request
    *                       startLong:
    *                           type: integer
    *                           description: Longitude of the start location of the ride created using the request
    *                       endLat:
    *                           type: integer
    *                           description: Latitude of the end location of the ride created using the request
    *                       endLong:
    *                           type: integer
    *                           description: Longitude of the end location of the ride created using the request
    *                       riderName:
    *                           type: string
    *                           description: Name of the rider for the ride created using the request
    *                       driverName:
    *                           type: string
    *                           description: Name of the driver for the ride created using the request
    *                       driverVehicle:
    *                           type: string
    *                           description: Plate number of the vehicle of the ride created using the request
    *                       created:
    *                           type: string
    *                           description: Date and time of the ride created using the request
    *       500:
    *          description: Server Error, Need to check server
    */
    app.get('/rides', (req, res) => {
        db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });


    /**
    * @swagger
    *
    * /rides/{id}:
    *   get:
    *     tags:
    *        - Rides
    *     name: Get ride by ID
    *     summary: Get ride data by the ID
    *     description: Use this API call to get the ride data for a given ID
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: id
    *         type: integer
    *         in: path
    *         description: ID of the ride to be retrieved
    *         example: 1
    *     responses:
    *       200:
    *           description: "Returns ride data. In case of no rides for the requested id, Error Message is shown {error_code: 'RIDES_NOT_FOUND_ERROR', message: 'Could not find any rides'}"
    *           schema:
    *               type: object
    *               properties:
    *                       rideID:
    *                           type: integer
    *                           description: Id of the ride created using the request
    *                       startLat:
    *                           type: integer
    *                           description: Latitude of the start location of the ride created using the request
    *                       startLong:
    *                           type: integer
    *                           description: Longitude of the start location of the ride created using the request
    *                       endLat:
    *                           type: integer
    *                           description: Latitude of the end location of the ride created using the request
    *                       endLong:
    *                           type: integer
    *                           description: Longitude of the end location of the ride created using the request
    *                       riderName:
    *                           type: string
    *                           description: Name of the rider for the ride created using the request
    *                       driverName:
    *                           type: string
    *                           description: Name of the driver for the ride created using the request
    *                       driverVehicle:
    *                           type: string
    *                           description: Plate number of the vehicle of the ride created using the request
    *                       created:
    *                           type: string
    *                           description: Date and time of the ride created using the request
    *       500:
    *          description: Server Error, Need to check server
    */
    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};
