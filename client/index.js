const PROTO_PATH = __dirname + '/../proto/grcp.proto';

const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    }
);

const example = grpc.loadPackageDefinition(packageDefinition).example;
const client = new example.Example("server:50051", grpc.credentials.createInsecure());

const app = express();

app.use(express.json());

app.get("/personas/all", async (_, res) => {
    client.getAll({}, (err, list) => {
        if (err) {
            console.log(err);
            res.json({});
        }

        res.json(list.list);
    });
});

app.get("/personas", async (req, res) => {
    const id = Number(req.query.id);

    client.GetById({ id: id }, (err, my_table) => {
        if (err) {
            console.log(err);
            res.json({});
        }

        res.json(my_table);
    })
});

app.listen(3000, () => {
    console.log("API running at port 3000");
})