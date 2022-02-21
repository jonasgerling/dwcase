const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({
    region: "eu-north-1",
    credentials: {
        accessKeyId: "access_key_id",
        secretKeyId: "secret_access_key",
    },
    endpoint: "http://localhost:8000"
});

module.exports = client;
