import { mockClient } from 'aws-sdk-client-mock';
import {getProduct, getProducts} from './products';
import { GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { beforeEach, describe, it } from "@jest/globals";
import {unmarshall} from "@aws-sdk/util-dynamodb";

const ddbMock = mockClient(DynamoDBClient);
describe("Products", () => {
    process.env['DYNAMODB_TABLE_NAME'] = "mock-table";
    beforeEach(() => {
        ddbMock.reset();
    });

    describe("getProduct", () => {
        it("should return product", async () => {
            const expectedId = "1";
            const item = {};

            const event = {
                pathParameters: {
                    id: expectedId
                }
            }
            ddbMock.on(GetItemCommand).resolves({
                Item: item
            });
            const response = await getProduct(event);
            expect(response.statusCode).toBe(200);
            expect(response.data).toEqual(item);
        });
    });

    describe("getProducts", () => {
        it("should return all products", async () => {
            const items = [{}];
            ddbMock.on(ScanCommand).resolves({
                Items: items
            });
            const response = await getProducts();
            expect(response.statusCode).toEqual(200);
        });
    });
});

