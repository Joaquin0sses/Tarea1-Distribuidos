const pg = require('pg');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = __dirname + "/../proto/grpc.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const example = protoDescriptor.example;

const connect_db = async () => {
    const client = new pg.Client();
    await client.connect();

    return client;
}

const getAll = async function(_, callback) {
    const pg_client = await connect_db();
    const res = await pg_client.query("SELECT * FROM my_table");
    await pg_client.end();

    console.log(res.rows);
    callback(null, { list: res.rows });
}

const getById = async function(call, callback) {
    const pg_client = await connect_db();
    const res = await pg_client.query("SELECT * FROM my_table WHERE id = $1", [call.request.id]);

    const my_table = res.rows[0];

    await pg_client.end();
    callback(null, {
        id: my_table.id,
        value: my_table.value,
    });
};

const server = new grpc.Server();

server.addService(example.Example.service, {
    getAll: getAll,
    getById: getById,
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log("Server running on port 50051");
});