var net = require('net');

var client = new net.Socket();

mc_port = 25565;
mc_host = "localhost";
clients = {};

function send_data(data, socket, client) {
	socket.write(Buffer.from(data.toString() + ""));
}

function make_client(port, host, main_socket, id) {
	var client = new net.Socket();
	client.connect(port, host, function() {
		console.log('Connected to Minecraft');
		main_socket.write(Buffer.from("connected:" + id));
	});
	client.on('data', function(data) {
		//console.log("Data from Minecraft Server");
		//console.log(data.toString());
		let buff = Buffer.from(`data:${id}:${data.toString('hex')}`);
		main_socket.write(buff);
	});
	client.on('close', function() {
		console.log('Minecraft Connection closed');
	});
	client.on('error', function(err) {
		console.log(err);
	});
	return client;
}

// connect to the server
client.connect(8001, 'localhost', function() {
	console.log("Connected to main Minetunnel Server");

	client.on('data', function(data) {
		//console.log(data.toString());
		if (data.toString().startsWith("new connection:")) {
			let id = data.toString().split(":")[1];
			clients[id] = make_client(mc_port, mc_host, client, id);
			console.log(`Made client ${id}`);
		} else if (data.toString().startsWith("client disconnected:")) {
			let id = data.toString().split(":")[1];
			let sock = clients[id];
			sock.destroy();
			console.log(`Killed client ${id}`);
		} else if (data.toString().startsWith("data:")) {
			let id = data.toString().split(":")[1];
			if (clients[id]) {
				let bufferData = data.toString().split(":")[2];
				let buffer = Buffer.from(bufferData, 'hex');
				//console.log(`Recieved data ${buffer.toString()}`);
				clients[id].write(buffer);
			}
		}
	});

	client.on('close', function() {
		console.log('Connection closed');
	});
	client.on('error', function(err) {
		console.log(err);
	});

});
