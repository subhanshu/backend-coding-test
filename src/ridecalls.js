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

  rides.saveRide = (startLatitude, startLongitude, endLatitude, endLongitude, riderName, driverName,driverVehicle) => {
    
    return new Promise((resolve,reject)=>{

      //Validate Parameters
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

      let values = [startLatitude, startLongitude, endLatitude, endLongitude, riderName, driverName,driverVehicle];
        
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

  rides.getRides = (page_no, page_size) => {

    return new Promise((resolve, reject)=>{

      let sql='';
      //console.log(page_no);
      if(page_no === -1 && page_size === -1){
    
        sql = 'SELECT * FROM Rides'
        
      }
      else{
    
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