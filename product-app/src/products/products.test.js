import {mockClient} from "aws-sdk-client-mock";
import {getProduct, getProducts} from "./products";
import {GetItemCommand, ScanCommand} from "@aws-sdk/client-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {beforeEach, describe, it} from "@jest/globals";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {mockData} from "../mockdata";

describe("Products", () => {
    const ddbMock = mockClient(DynamoDBClient);
    const event = {
        pathParameters: {
            id: "0"
        }
    }
    process.env["DYNAMODB_TABLE_NAME"] = "mock-table";
    beforeEach(() => {
        ddbMock.reset();
    });

    describe("getProduct", () => {
        it("should return product", async () => {
            const item = mockData[0];
            const event = {
                pathParameters: {
                    id: "2"
                }
            }
            ddbMock.on(GetItemCommand).resolves({Item: item});
            const response = await getProduct(event);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body).data).toEqual(unmarshall(item));
        });

        it("should return 404 when product is not found", async () => {
            const item = {}
            ddbMock.on(GetItemCommand).resolves(item);
            const response = await getProduct(event);
            expect(response.statusCode).toBe(404);
        });

        it("should return 500 when when service is unavailable", async () => {
            ddbMock.on(GetItemCommand).rejects();
            const response = await getProduct(event);
            expect(response.statusCode).toBe(500);
        });
    });

    describe("getProducts", () => {
        it("should return all products", async () => {
            const items = mockData;
            ddbMock.on(ScanCommand).resolves({
                Items: items
            });
            const response = await getProducts();
            expect(response.statusCode).toEqual(200);
            expect(JSON.parse(response.body).data).toHaveLength(2)
        });

        it("should return 500 when service is unavailable", async () => {
            ddbMock.on(ScanCommand).rejects();
            const response = await getProducts();
            expect(response.statusCode).toEqual(500);
        });
    });
});
