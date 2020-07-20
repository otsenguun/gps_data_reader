
var net = require('net');
var mysql = require('mysql');



var server = net.createServer();   

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gpsdata"
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

  var checksum = Checksum(checksum_string);


  return header + length + datatype + serialnumber + checksum;


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

    var sql = "INSERT INTO data (data, ip) VALUES ('"+ d +"','"+ remoteAddress +"')";
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