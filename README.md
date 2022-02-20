###Clone repo and install dependencies
```
git clone git@github.com:jonasgerling/dwcase.git
```
Install dependencies
```
npm install
```

###Install global dependencies
```
npm i -g serverless serverless-dynamodb-local serverless-offline
```
###To run
Change directory to product-app
```
cd product-app
```
First install local DynamoDB
```
sls dynamodb install
```
To start
```
sls offline start
```
Server should be up and running on http://localhost:8000

###Local lambdas
Local lambdas are running on at http://localhost:3000
####Scheduled data seed
The data seed runs every 3 minutes by default.
Can be changed in serverless.yaml

####Endpoints
To get all products http://localhost:3000/dev/products
To get single product http://localhost:3000/dev/products/{id}
