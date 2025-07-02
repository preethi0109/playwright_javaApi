import { test, expect, request, APIResponse } from "@playwright/test";
import { readProperties } from '../utils/commonutils';
import fs from "fs";
import Ajv from "ajv";
import qs from "querystring"

export class ApiClient {
  async sendRequest({
    method,
    url,
    expectedStatusCode,
    expectedFields,     // Optional
    jsonPath,           // Optional
    queryParams,        // Optional
    authHeaders,        // Optional
    requestBody,        // Optional (for POST, PUT, PATCH)
    urlEncodedBody,
  }: {
    method: string;
    url: string;
    expectedStatusCode: number;
    expectedFields?: Record<string, any>;
    jsonPath?: string;
    queryParams?: Record<string, string>;
    authHeaders?: Record<string, string>;
    requestBody?: Record<string, any>;
    urlEncodedBody?: Record<string, any>;
  }): Promise<APIResponse> {
    let response: APIResponse | null = null;
    let failureReason = "";

    try {
      const context = await request.newContext({ ignoreHTTPSErrors: true },);
      const requestBuilder = context[method.toLowerCase()].bind(context);

      const requestOptions = this.buildRequestOptions(authHeaders, queryParams, requestBody, urlEncodedBody, method);

      response = await requestBuilder(url, requestOptions);


      if (!response) {
        throw new Error("No response received from API")
      }
      else {
        console.log("Response: " + JSON.stringify(await response?.json()))
      }

      failureReason += await this.validateResponse(response, expectedStatusCode, expectedFields, jsonPath, failureReason);

      //Report failure in Playwright test report
      expect(failureReason).toBe("",);
      return (response);

    } catch (error) {
      // expect(response).not.toBeNull(); // Ensures API call is captured in the report
      throw new Error(`API Test Failed: ${error}\n${failureReason}`);
    }
  }

  //Method to set the Request
  private buildRequestOptions(
    authHeaders?: Record<string, string>,
    queryParams?: Record<string, string>,
    requestBody?: Record<string, any>,
    urlEncodedBody?: Record<string, any>,
    method?: string
  ): Record<string, any> {
    const headers = { "Content-Type": "application/json", ...(authHeaders || {}) };
    const params = queryParams || {};
    const requestOptions: Record<string, any> = { headers, params };

    if (["post", "put", "patch"].includes(method?.toLowerCase() || "")) {
      if (requestBody) {
        requestOptions.headers["Content-Type"] = "application/json";
        requestOptions["data"] = requestBody;
      } else if (urlEncodedBody) {
        requestOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
        requestOptions["data"] = qs.stringify(urlEncodedBody);
      }
    }
    return requestOptions;
  }

  //Method for Response Validation
  private async validateResponse(
    response: APIResponse,
    expectedStatusCode: number,
    expectedFields?: Record<string, any>,
    jsonPath?: string,
    failureReason?: string
  ): Promise<string> {

    if (jsonPath) {
      const expectedSchema = JSON.parse(fs.readFileSync(`src/schemas/${jsonPath}`, "utf8"));
      try {
        this.validateJsonSchema(response, expectedSchema);
      } catch (error) {
        failureReason += `JSON Schema Validation Failed: ${error}\n`;
      }
    }

    if (expectedFields) {
      failureReason += this.validateJsonFields(await response.json(), expectedFields);
    }

    if (response.status() !== expectedStatusCode) {
      failureReason += `Status Code Mismatch: Expected ${expectedStatusCode}, Got ${response.status()}\n`;
    }

    return failureReason ?? "";
  }

  //Method for Schema Validation
  private async validateJsonSchema(response: APIResponse, expectedSchema: JSON) {
    const ajv = new Ajv();
    const validate = ajv.compile(expectedSchema);
    const responseBody = await response.json();
    if (!validate(responseBody)) {
      throw new Error(`Schema validation errors: ${JSON.stringify(validate.errors)}`);
    }
  }

  //Method for JSON Fields Validation
  private validateJsonFields(responseBody: any, expectedFields: Record<string, any>): string {
    let failureReason = "";
    for (const [key, expectedValue] of Object.entries(expectedFields)) {
      if (responseBody[key] !== expectedValue) {
        failureReason += `Mismatch: ${key} Expected: ${expectedValue}, Found: ${responseBody[key]}\n`;
      }
    }
    return failureReason;
  }
}
