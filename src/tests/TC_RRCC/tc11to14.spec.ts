import { test, expect  } from '@playwright/test';
import { readProperties, readTestData, getAccessToken, fileName } from '../../utils/commonutils';
import { ApiClient } from '../../utils/apiClient';

const apiClient = new ApiClient();

test("TC11 - Invalid DOI in Similarity Query", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("tc_11_SIM_Doi",fileName.Json);
  const response = await apiClient.sendRequest({
    method: "GET",
    url: readProperties("simlarityDoi"),
    expectedStatusCode: 400,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });

  // Validate the error response  
    
const responseBody = await response.json();
expect(responseBody).toHaveProperty('error_code', 400);
expect(responseBody).toHaveProperty('error_message', 'Invalid DOI');
});

test("TC12 - Successful Similarity Query", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("tc_12_SIM_Doi",fileName.Json);
  const response = await apiClient.sendRequest({
    method: "GET",
    url: readProperties("simlarityDoi"),
    expectedStatusCode: 200,
    queryParams: userData.queryParams,
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
});

test("TC13 - Missing DOI Parameter in Similarity Query", async() => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
 
  const response = await apiClient.sendRequest({
    method: "GET",
    url: readProperties("simlarityDoi"),
    expectedStatusCode: 400,
    
    authHeaders: {
      "Authorization": "Bearer " + token
    }
  });
  // Validate the error response  
    expect(response.status()).toBe(400);
const responseBody = await response.json();
expect(responseBody).toHaveProperty('error_code', 400);
expect(responseBody).toHaveProperty('error_message', "Required String parameter 'doi' is not present");
});

test("TC14 - Invalid num Parameter in Similarity Query", async () => {
  const token = await getAccessToken("accessToken", "accessTokenEndpoint");
  const userData = readTestData("tc_14_SIM_Doi", fileName.Json);

  const response = await apiClient.sendRequest({
    method: "GET",
    url: readProperties("simlarityDoi"),
    expectedStatusCode: 400,
    queryParams: userData.queryParams,
    authHeaders: {
      Authorization: "Bearer " + token
    }
  });

  // Validate the error response  
    expect(response.status()).toBe(400);
const responseBody = await response.json();
expect(responseBody).toHaveProperty('error_code', 400);
expect(responseBody).toHaveProperty('error_message', 'Value of num should be 1 - 5');

});
