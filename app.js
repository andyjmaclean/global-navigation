var http = require("http");
var url  = require("url");
var fs   = require("fs");
var path = require("path");
var port = process.env.PORT || 3000;


var server = http.createServer(function(request, response) {

  var uri        = url.parse(request.url).pathname
  var filename   = path.join(process.cwd(), uri);
  var serverName = request.headers.host;
  var params     = url.parse(request.url, true).query; 
  
  fs.exists(filename, function(exists) {
	  
	  
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if(fs.statSync(filename).isDirectory()){
    	filename += 'index.html';
    }

    
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write('Error reading file ' + filename + ':\n\nserverName: ' + serverName + ', uri: ' + uri + ', params: ' + JSON.stringify(params));
        response.write(err + "\n");
        response.end();
        return;
      }
      
      response.writeHead(200);

      var regexExt = /\.[0-9a-z]+$/i;
      var ext      = filename.match(regexExt);
      
      if(ext == '.html'){
    	  response.write('<!doctype html>');
    	  response.write('  <html>');
    	  response.write('    <head>');

    	  // # These 3 scripts (unquoted) are what would be included to add GN to a web page in a real deploy
    	   
    	  response.write('      <script type="text/javascript" src="http://' + serverName + '/scripts/jquery-1.8.1.js"></script>');
    	  response.write('      <script type="text/javascript" src="http://' + serverName + '/scripts/GlobalNav2.js"></script>');
    	  response.write('      <script type="text/javascript">');
    	  response.write('         globalNavServer ="http://' + serverName + '";');
    	  response.write('      </script>');
    	  response.write('    </head>');
    	  response.write('    <body>');
          response.write(file, "binary");
    	  response.write('    </body>');
    	  response.write('  </html>');

      }
      else{
    	  response.write(file, "binary");    	  
      }
      response.end();
      
    });
  });
}).listen(port);

console.log('Server running on port ' + server.address().port);

  