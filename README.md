
# exbanking service performance test module

This project is a load testing suite for the Exbanking Management Service, executed using K6. It is designed to test the "Create User" scenario under various load conditions to evaluate the service's performance.

## Prerequisites

- K6: To install K6 on your machine, follow the instructions on the [official K6 website](https://k6.io/docs/getting-started/installation/).
- npm 6.14.11
- node v14.16.0

## Building the Project

To build the load testing project, run the following command:

```sh
npm install
```

## Starting the Exbanking Management Service

Before executing the load tests, start the Exbanking Management Service application by running the following command from the parent directory:
```sh
java -jar external-management-service.jar
```

## Running the Load Tests

To execute the load tests, use the following command:

```sh
npm run start
```
This command will start the load testing process, randomly selecting user combinations and applying concurrent loads for a specified duration.

## Test Results

The test results will be displayed in HTML format, providing a detailed and user-friendly representation of the load test outcomes.

## Generating the Test Summary Report

To generate the test summary report in HTML format, execute the following command:

```sh
node reportConfig.js
```
