//Winston
const winston = require('winston');
const   logConfig = {
  'transports':[
    new winston.transports.File({
      filename:'./logs/api.log'
    })
  ]
};
//create logger
const logger = winston.createLogger(logConfig);


module.exports = (db) => {

  let rides={};

  rides.saveRide = (req) => {
    
    return new Promise((resolve,reject)=>{

      //Validate Parameters

      const startLatitude = Number(req.body.start_lat);
      const startLongitude = Number(req.body.start_long);
      const endLatitude = Number(req.body.end_lat);
      const endLongitude = Number(req.body.end_long);
      const riderName = req.body.rider_name;
      const driverName = req.body.driver_name;
      const driverVehicle = req.body.driver_vehicle;

      if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {

        const msg = {
          error_code: 'VALIDATION_ERROR',
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
        }
        logger.error(msg.error_code + ' - ' +msg.message);
        reject(msg);    
      
      }

      if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {

        const msg = {
          error_code: 'VALIDATION_ERROR',
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
        }
        logger.error(msg.error_code + ' - ' +msg.message);
        reject(msg);    
      
      }

      if (typeof riderName !== 'string' || riderName.length < 1) {

        const msg = {
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string'
        }
        logger.error(msg.error_code + ' - ' +msg.message);
        reject(msg);    
      
      }

      if (typeof driverName !== 'string' || driverName.length < 1) {

        const msg = {
          error_code: 'VALIDATION_ERROR',
          message: 'Driver name must be a non empty string'
        }
        logger.error(msg.error_code + ' - ' +msg.message);
        reject(msg);    
      
      }

      if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {

        const msg = {
          error_code: 'VALIDATION_ERROR',
          message: 'Driver Vehicle must be a non empty string'
        }
        logger.error(msg.error_code + ' - ' +msg.message);
        reject(msg);    
      
      }

      let values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
      db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function(err) {

        if (err) {
      
          const msg = {
            error_code: 'SERVER_ERROR',
            message: 'Unknown error'
          }
          logger.error(msg.error_code + ' - ' +msg.message);
          reject(msg);
            
        }
      
        db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function(err, rows) {
      
          if (err) {

            const msg = {
              error_code: 'SERVER_ERROR',
              message: 'Unknown error'
            }
            logger.error(msg.error_code + ' - ' +msg.message);
            reject(msg);
              
          }
      
          resolve(rows);
            
        });
          
      });
    
    });
 
  };

  rides.getRides = (req) => {

    return new Promise((resolve, reject)=>{

      let sql='';
      if(Object.keys(req.query).length === 0){
    
        sql = 'SELECT * FROM Rides'
        
      }
      else{
    
        const page_no = Number(req.query.page_no);
        const page_size = Number(req.query.page_size);
    
        sql = 'SELECT * FROM Rides LIMIT ' + page_size + ' OFFSET '+ (page_no-1)*page_size; 
        
      }
      db.all(sql, function(err, rows) {
           
        if (err) {

          const msg = {
            error_code: 'SERVER_ERROR',
            message: 'Unknown error'
          }
          logger.error(msg.error_code + ' - ' +msg.message + err);
          reject(msg);
            
        }
        else{

          if (rows.length === 0) {
      
            const msg = {
              error_code: 'RIDES_NOT_FOUND_ERROR',
              message: 'Could not find any rides'
            }
            logger.error(msg.error_code + ' - ' +msg.message);
            reject(msg);
                            
          }
          resolve(rows); 
        
        }
      
      });
    
    });
  
  };

  //Function get rides by id
  rides.getRidesById = (rideID) =>{

    return new Promise((resolve, reject) => {

      db.all(`SELECT * FROM Rides WHERE rideID=${rideID}`, function(err, rows) {

        if (err) {

          const msg = {
            error_code: 'SERVER_ERROR',
            message: 'Unknown error'
          }
          logger.error(msg.error_code + ' - ' +msg.message + err);
          reject({msg});

        }
        else{

          if (rows.length === 0) {

            const msg = {
              error_code: 'RIDES_NOT_FOUND_ERROR',
              message: 'Could not find any rides'
            }
            logger.error(msg.error_code + ' - ' +msg.message);
            reject({msg});
              
          }
                      
          resolve(rows);
        
        }
    
        
      
      });
    
    });
  
  };
  //Function getRidesById ends

  return rides;

}