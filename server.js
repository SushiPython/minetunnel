var net = require('net');

main_client = null;
let clients = {};
let ids = {};

// generate id 
function generate_id() {
    return Math.floor(Math.random() * 1000000).toString();
}

net.createServer(function(socket) {
    if (!main_client) {
        console.log("main client set")
        main_client = socket;
    } else {
        console.log("new client connected")
        // create buffer with text "new connection"
        let id = generate_id()
        var buffer = Buffer.from("new connection:" + id);
        clients[id] = socket;
        ids[socket] = id;
        main_client.write(buffer);
    }
    socket.on('data', function(data){
        //console.log(data.toString());
        if (data.toString().startsWith("connected:")) {
			console.log("connection acknowledged");
        } else if (data.toString().startsWith("data:")) {
            let id = data.toString().split(":")[1];
            let bufferData = data.toString().split(":")[2];
            let buffer = Buffer.from(bufferData, 'hex');
            //console.log(`Recieved data ${buffer.toString()}`);
            clients[id].write(buffer);
        } else {
            //console.log(clients);
            //console.log(ids);
            let buff = Buffer.from(`data:${ids[socket]}:${data.toString('hex')}`);
            main_client.write(buff);
        }
    });

    socket.on('close', function(){
        console.log('Client Disconnected');
        main_client.write(Buffer.from("client disconnected:" + ids[socket]));
    });

    socket.on('error', function(err){
        console.log(err);
    });
}).listen(8001);
