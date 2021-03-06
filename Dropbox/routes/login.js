var express=require('express');
var router=express.Router();
var mysql=require('mysql');
var mysqlDB=require('./mysqlDB');

function fetchData(callback,sqlQuery){
	var pool=mysqlDB.getConnectionP();
	/*con.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	
			console.log("DB Results:"+rows);
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	con.end();*/
	
	pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   
        else{
        console.log('connected as id ' + connection.threadId);

        connection.query(sqlQuery,function(err,rows){
            connection.release();
            if(!err) {
    			console.log("DB Results:"+rows);
    			callback(err, rows);
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
	}
  });
	
}

router.post('/checklogin',function(req,res){
	var username=req.body.username;
	var password=req.body.password;
	var sqlQuery="select * from user_details where email='"+username+"' and password='"+password+"';";
	fetchData(function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.length > 0){
			      req.session.userid = results[0].userID;
			      req.session.username = username;
			      console.log("Session userId: "+req.session.userid);
			      console.log("Session userId: "+req.session.username);
			      console.log("session initilized")
				res.status(201).json({output:results, session:1});
			}
			else {
				console.log("Results: Wrong login");
				res.status(201).json({output:0});
			}
		}
	},sqlQuery);
	});


router.post('/logout', function(req,res) {
	  console.log(req.session.username);
	  req.session.destroy();
	  console.log('Session Destroyed');
	  res.status(200).json({session:0});
	});


module.exports=router;