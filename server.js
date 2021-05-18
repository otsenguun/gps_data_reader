
var net = require('net');
var mysql = require('mysql');



var server = net.createServer();   

var con = mysql.createConnection({
  host: "localhost",
  user: "gps",
  password: "12345678",
  database: "gps"
});


server.on('connection', handleConnection);



server.listen(8080, function() {    
  console.log('server listening to %j', server.address());  
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB is Connected!");
});


const https = require('https')


function sendTT(gps_date,lat,lon,number){

  const data = JSON.stringify({
   "traffic": [
      {
        "date": gps_date,
        "location": lat+","+lon,
        "number": number
      }
    ]
  })

  const options = {
    hostname: 'http://admin.ett.mn/api/other/traffics/',
    port: 80,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization' : "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRzZW5ndXVua29rbyIsIm9yaWdfaWF0IjoxNjE4Mzc0MjMxLCJ1c2VyX2lkIjoxNzYsImVtYWlsIjoidHNlbmd1dW5rb2tvQGdtYWlsLmNvbSIsImV4cCI6MTYyMDk2NjIzMX0._s0lpXaYdDfbbv7IkYNrC6zxGrdUQmcW8gthpxzYBHo"
    }
  }

  const req = https.request(options, res => {

    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()

  console.log('sendTT response : ');

  // console.log();


}

function Checksum(s) {

  var lenght = s.length;
    
  var result = 0;
    
  for(var i=0;i<lenght;i++)
  {
      
        var cut_string = s.slice(i, i+1);
        
        var o = cut_string.charCodeAt(0);
 
     result = result ^ o;

  }
    
    var hexString = result.toString(16);
    var id = "0"+hexString;
    var response = id.substr(id.length - 2);
return response;

  
  
}


function returndata(string){


  var data = string;

  var header = string.slice(0, 2);
  var length = string.slice(2, 6);
  var datatype = string.slice(6, 8);
  var serialnumber = string.slice(110, 114);
  var checksum_string = string.substring(0, string.length - 2);

  var checksum = Checksum(header + "0014"+ "AA" + serialnumber);


  return header + "0014"+ "AA" + serialnumber + checksum;



}

function calculatedate(string){
  var year = string.slice(0, 2);
  var month = string.slice(2, 4);
  var day = string.slice(4, 6);
  var hour = string.slice(6, 8);
  var min = string.slice(8, 10);
  var second = string.slice(10, 12);
  return "20"+year+"-"+month+"-"+day+" "+hour+":"+min+":"+second;
}

 function insert_last_data(data,imei,datetime,angle,speed,lat,long,server_date){

      var check_last_distance_sql = ("SELECT id FROM last_distances WHERE imei = "+imei+" LIMIT 1;");
     
      con.query(check_last_distance_sql, function(error, results, fields) {
          if(error) {
              console.log(error);
              return;
          }

          if(results != ""){

            var rows = JSON.parse(JSON.stringify(results[0]));
        
              if(rows && rows.id != ""){
                    var sql =  ("UPDATE last_distances SET data = "+"'"+ data+"'" +",imei ="+"'"+ imei +"'"+", datetime="+"'"+ datetime +"'"+", angle="+"'"+ angle+"'" +", speed="+"'"+ speed+"'" +", lat="+"'"+ lat+"'" +", lng="+"'"+ long+"'" +",updated_at="+"'"+ server_date +"'"+" WHERE imei='"+imei+"'");
                    queryExecute(sql);
              }else{
                    var sql =  ("INSERT INTO last_distances (data,imei, datetime, angle, speed, lat, lng,created_at) VALUES('"+ data +"','"+ imei +"','"+ datetime +"','"+ angle +"','"+ speed+"','"+ lat +"','"+ long +"','" + server_date+"')");
                    queryExecute(sql);

              }
          }else{
                var sql =  ("INSERT INTO last_distances (data,imei, datetime, angle, speed, lat, lng,created_at) VALUES('"+ data +"','"+ imei +"','"+ datetime +"','"+ angle +"','"+ speed+"','"+ lat +"','"+ long +"','" + server_date+"')");
                queryExecute(sql);
          }
          
          
      });
      

     

 }

 function insert_data(data){

  var string = data;
  var header = string.slice(0, 2);
  var length = string.slice(2, 6);
  var datatype = string.slice(6, 8);
  var imei = string.slice(8, 23);
  var vehiclestatus = string.slice(24, 32);
  var datetime = calculatedate(string.slice(32, 44));
  var batvoltage = string.slice(44, 46);
  var supvoltage = string.slice(46, 48);
  var adc = string.slice(48, 52);
  var tempa = string.slice(52, 56);
  var tempb = string.slice(56, 60);
  var lacci = string.slice(60, 64);
  var cellid = string.slice(64, 68);
  var gpssatellites = string.slice(68, 70);
  var gsmsignal = string.slice(70, 72);
  var angle = string.slice(72, 75);
  var speed = string.slice(75, 78);
  var hdop = string.slice(78, 82);
  var mileage = string.slice(82, 89);
  var lat = string.slice(89, 98);
  var ns = string.slice(98, 99);
  var long = string.slice(99, 109);
  var ew = string.slice(109, 110);
  var serialnumber = string.slice(110, 114);

  let date_ob = new Date();

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

var server_date = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
// prints date & time in YYYY-MM-DD HH:MM:SS format

  insert_last_data(data,imei,datetime,angle,speed,lat,long,server_date);

  return "INSERT INTO data (data, imei, vehiclestatus, datetime, batvoltage, supvoltage, tempa, tempb, gpssatellites, gsmsignal, angle, speed, hdop, mileage, lat, ns, lng, ew, serialnumber,created_at) VALUES ('"+ data +"','"+ imei +"','"+ vehiclestatus+"','"+ datetime +"','"+ batvoltage +"','"+ supvoltage +"','"+ tempa +"','"+ tempb +"','"+ gpssatellites +"','"+ gsmsignal +"','"+ angle +"','"+ speed +"','"+ hdop +"','"+ mileage +"','"+ lat +"','"+ ns +"','"+ long +"','"+ ew +"','"+ serialnumber +"','"+server_date+"')";

}

function validate(data){
  // return data.length;
  if(data.length == 116){
    return true;
  }else{
    return false;
  }

}


function GetqueryResult(result){
  return result;
}

function queryExecute(sql){
  console.log('try sql');
  var return_res;
  con.query(sql, function (err, result) {
    if (err) throw err;
    
    var return_sql = Object.values(JSON.parse(JSON.stringify(result)));
    // GetqueryResult(return_sql);
    // console.log(return_sql);

    // return return_sql;

  });

}

function handleConnection(conn) {    
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;  
  console.log('new client connection from %s', remoteAddress);
  conn.setEncoding('utf8');
  conn.on('data', onConnData);  
  conn.once('close', onConnClose);  
  conn.on('error', onConnError);
  function onConnData(d) {  
    console.log('connection data from %s: %j', remoteAddress, d);  

    conn.write(returndata(d));  
    console.log('Gps send data :' + returndata(d) );

    // insert_data(d,remoteAddress);

    var sql = insert_data(d,remoteAddress);
    
    // console.log(validate(d));

    if(validate(d) == true){
      // queryExecute(sql);
    }

  }
  function onConnClose() {  
    console.log('connection from %s closed', remoteAddress);  
  }
  function onConnError(err) {  
    console.log('Connection %s error: %s', remoteAddress, err.message);  
  }  
}
