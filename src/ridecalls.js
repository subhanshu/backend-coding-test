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

  rides.saveRide = (values) => {

    return new Promise((resolve,reject)=>{

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

  rides.getRides = (sql) => {

    return new Promise((resolve, reject)=>{

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