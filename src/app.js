'use strict';

const express = require('express');
const app = express();
//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerDef = require('../swaggerDef');
const swaggerSpec = swaggerJSDoc(swaggerDef);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {

  const rides = require('./ridecalls')(db);


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
  app.get('/health', (req, res) =>  res.send('Healthy'));

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
  app.post('/rides', jsonParser, async(req, res) => {

    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;


    try{

      const result = await rides.saveRide(startLatitude, startLongitude, endLatitude, endLongitude, riderName, driverName,driverVehicle);
      res.send(result);
    
    }
    catch(err){

      res.send(err);
    
    }
  
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
    *     description: Use this API call to get all the rides in the system. Without any parameters it will return all the records else if you want to use pagination then provide the two parameters 'page_no' and 'page_size'
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: page_size
    *         description: No of records you want to get from the API
    *         type: integer
    *         required: false
    *       - name: page_no
    *         description: Page no of the records you want to pull
    *         type: integer
    *         required: false
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
  app.get('/rides', async(req, res) => {

    let page_no;
    let page_size;
    if(Object.keys(req.query).length === 0){

      page_no =-1;
      page_size = -1
    
    }
    else
    {

      page_no = req.query.page_no;
      page_size = req.query.page_size;
    
    }
    
    try{

      const result = await rides.getRides(page_no, page_size);
      res.send(result)
    
    }
    catch(err){

      res.send(err);
    
    }
  
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
    *               type: array
    *               items:
    *                 properties:
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
  app.get('/rides/:id', async(req, res) => {

    try{

      const result = await rides.getRidesById(req.params.id);
      await res.send(result);
    
    }
    catch(err){

      await res.send(err);
    
    }
    
  });

  return app;

};
