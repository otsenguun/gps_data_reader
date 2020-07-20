
var net = require('net');
var mysql = require('mysql');



var server = net.createServer();   

var con = mysql.createConnection({
  host: "localhost",
  user: "forge",
  password: "",
  database: "forge"
});


server.on('connection', handleConnection);



server.listen(9000, function() {    
  console.log('server listening to %j', server.address());  
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB is Connected!");
});



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

  var server_date = new Date().toJSON().slice(0, 19).replace('T', ' ');
  return "INSERT INTO data (data, imei, vehiclestatus, datetime, batvoltage, supvoltage, tempa, tempb, gpsatellites, gsmsignal, angle, speed, hdop, mileage, lat, ns, long, ew, serialnumber,created_at) VALUES ('"+ data +"','"+ imei +"','"+ datetime +"','"+ batvoltage +"','"+ supvoltage +"','"+ tempa +"','"+ tempb +"','"+ gpssatellites +"','"+ gsmsignal +"','"+ angle +"','"+ speed +"','"+ hdop +"','"+ mileage +"','"+ lat +"','"+ ns +"','"+ long +"','"+ ew +"','"+ serialnumber +"','"+server_date+'")';

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

    insert_data(d,remoteAddress);

    var sql = insert_data(d,remoteAddress);

    con.query(sql, function (err, result) {

      if (err) throw err;
      console.log("1 record inserted");
    });
  }
  function onConnClose() {  
    console.log('connection from %s closed', remoteAddress);  
  }
  function onConnError(err) {  
    console.log('Connection %s error: %s', remoteAddress, err.message);  
  }  
}