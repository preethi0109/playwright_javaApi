import { test } from '@playwright/test';
import { readProperties, readTestData, getAccessToken, fileName } from '../../utils/commonutils';
import { ApiClient } from '../../utils/apiClient';

const apiClient = new ApiClient();



test("TC01 - Verify API Connectivity", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("getUser",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("routeGet"),
    expectedStatusCode: 200,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});

test("TC02 - Verify 404 Not Found for Invalid Endpoint", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("getUser",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("invalidGet"),
    expectedStatusCode: 404,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});

test("TC03 - Verify 404 error message for invalid user", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("tc03_get",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("getUser"),
    expectedStatusCode: 400,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});

test("TC04 - Verify 405 Method Not Allowed on POST", async () => {
  const testData = readTestData("tc_01_POST_Request",fileName.Json);
  const token = await getAccessToken("accessTokenForAuthentication", "accessTokenForAuthenticationEndpoint");
  //method using access token
  await apiClient.sendRequest({
    method: "POST",
    url: readProperties("routePost"),
    expectedStatusCode: 405,
    requestBody: testData.requestBody,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});


test("TC05 - Verify 405 on Invalid Data Format", async () => {
  const testData = readTestData("tc_01_POST_Request",fileName.Json);
  const token = await getAccessToken("accessTokenForAuthentication", "accessTokenForAuthenticationEndpoint");

  // Intentionally malformed JSON string to simulate invalid data format
  const invalidRequestBody = '{"invalidJson":true'; // Missing closing brace


await apiClient.sendRequest({
  method: "POST",
  url: readProperties("routePost"),
  expectedStatusCode: 405,
  authHeaders: {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json"
  }
});

});

test("TC06 - Verify Auth and Token Validation", async() => {

  // Without token
   const testData = readTestData("getUser",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("routeGet"),
    expectedStatusCode: 400
  });

  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("getUser",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("routeGet"),
    expectedStatusCode: 200,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});

test("TC07 - Verify API Versioning with Valid Model", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("tc_07_POST_Request",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("routeGet"),
    expectedStatusCode: 200,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});



test("TC08 - Verify Invalid Model Name Returns Error", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("tc_08_POST_Request",fileName.Json);
  await apiClient.sendRequest({
    method: "GET",
    url: readProperties("routeGet"),
    expectedStatusCode: 400,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});