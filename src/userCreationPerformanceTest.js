import grpc from "k6/net/grpc";
import { sleep, check } from "k6";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const userCreationData = open('user-creation-data.json');
const createUserAPI = "com.yolo.assignment.exbankingservice.UserService/create_user";

const client = new grpc.Client();
client.load(["app/proto/"], "exbanking-management-service.proto");

export function connect(host) {
  client.connect(host, {
    plaintext: true,
  });
}

export function createUserRequest(record) {
  return {
    user: {
      "firstName": record.user.firstName,
      "lastName": record.user.lastName,
      "passportNo": record.user.passportNo,
      "contactInfo": record.user.contactInfo,
      "address": record.user.address
      },
    };
}

export function setup() {
  return JSON.parse(userCreationData);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'src/app/report/execution-results.json': JSON.stringify(data)
  };
}

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users over 5 minutes
    { duration: '2m', target: 20 },  // Ramp up to 20 users over the next 5 minutes
    { duration: '2m', target: 20 },  // Hold at 20 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users over 5 minutes
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% of requests should be below 500ms
    'http_req_failed': ['rate<0.01'],    // Error rate should be below 1%
  },
};

export default (userCreationData) => {
  const record = userCreationData[__ITER % userCreationData.length];
  const request = createUserRequest(record);

  const url = __ENV.HOST.concat(":").concat(__ENV.PORT);
  connect(url);

  const response = client.invoke(createUserAPI, request);
  check(response, {
    "is status OK": (r) => r && r.status === grpc.StatusOK,
  });

  check(response.message, {
    "user id": (r) => r && r.user.id !== null,
    "user first name": (r) => r && r.user.firstName === request.user.firstName,
    "user last name": (r) => r && r.user.lastName === request.user.lastName,
    "user passport number": (r) => r && r.user.passportNo === request.user.passportNo,
    "user address": (r) => r && r.user.address === request.user.address,
    "user email": (r) => r && r.user.contactInfo.email === request.user.contactInfo.email,
    "user telephone number": (r) => r && r.user.contactInfo.telephone.countryCode.concat(r.user.contactInfo.telephone.number) === request.user.contactInfo.telephone.countryCode.concat(request.user.contactInfo.telephone.number) ,
    "user created at": (r) => r && r.user.auditInfo.createdAt !== null,
    "user created by": (r) => r && r.user.auditInfo.createdBy !== null,
    "user modified at": (r) => r && r.user.auditInfo.modifiedAt !== null,
    "user modifier by": (r) => r && r.user.auditInfo.modifiedBy !== null,
    "user active status": (r) => r && r.user.auditInfo.status === "ACTIVE",
    "user version": (r) => r && r.user.auditInfo.version === 0,
    "account id": (r) => r && r.account.id !== null,
    "account user id": (r) => r && r.account.userId === r.user.id,
    "account number": (r) => r && r.account.accountNumber !== null,
    "account type": (r) => r && r.account.accountType !== null,
    "account balance": (r) => r && r.account.balance === 0,
    "account currency id": (r) => r && r.account.currencyId !== null,
    "account created at": (r) => r && r.account.auditInfo.createdAt !== null,
    "account created by": (r) => r && r.account.auditInfo.createdBy !== null,
    "account modified at": (r) => r && r.account.auditInfo.modifiedAt !== null,
    "account modifier by": (r) => r && r.account.auditInfo.modifiedBy !== null,
    "account active status": (r) => r && r.account.auditInfo.status === "ACTIVE",
    "account version": (r) => r && r.account.auditInfo.version === 0,
  });

  client.close();
  sleep(1);
};
