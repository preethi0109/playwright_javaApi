import { test, expect, request, APIResponse } from "@playwright/test";
import fs from "fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { validateXML } from "xmllint-wasm";

// import  { readBuffer, XmlDocument }  from "libxml2-wasm";
// import * as xmlrd from 'libxmljs';



export class XmlApiClient {
    async sendRequest({ method, url, expectedStatusCode, expectedFields, requestBody, headers, queryParams, xsdSchemaPath, }: { method: string; url: string; expectedStatusCode: number; expectedFields?: Record<string, any>; requestBody?: Record<string, any>; headers?: Record<string, string>; queryParams?: Record<string, string>; xsdSchemaPath?: string; }): Promise<APIResponse> {
        let response: APIResponse | null = null;
        let failureReason = "";
        try {
            const context = await request.newContext({ ignoreHTTPSErrors: true });
            const requestBuilder = context[method.toLowerCase()].bind(context);

            const requestOptions: Record<string, any> = {
                headers: {
                    "Content-Type": "application/xml",
                    ...(headers || {}),
                },
                params: queryParams || {},
            };

            if (requestBody) {
                const builder = new XMLBuilder();
                requestOptions.data = builder.build(requestBody);
            }

            response = await requestBuilder(url, requestOptions);
            if (!response) throw new Error("No response received from API");

            const responseText = await response.text();
            // console.log("Response XML:", responseText);

            // Convert XML response to JSON for validation
            const parser = new XMLParser();
            const jsonResponse = parser.parse(responseText);

            // Validate response fields
            if (expectedFields) {
                failureReason += this.validateXmlFields(jsonResponse["root"], expectedFields);
            }

            console.log('xsdSchemaPath', xsdSchemaPath)
            // Validate XSD Schema (if provided)
            if (xsdSchemaPath) {
                const schema = fs.readFileSync(`src/schemas/${xsdSchemaPath}`, "utf8");
                // console.log("schema"+schema);
                failureReason += await this.validateXMLSchema(responseText, schema);
            }

            // Check status code
            if (response.status() !== expectedStatusCode) {
                failureReason += `Status Code Mismatch: Expected ${expectedStatusCode}, Got ${response.status()}\n`;
            }

            expect(failureReason).toBe("true"); // Report failure in test
            return response;
        } catch (error) {
            throw new Error(`API Test Failed: ${error}\n${failureReason}`);
        }

    }

    private validateXmlFields(responseBody: any, expectedFields: Record<string, any>): string {
        let failureReason = "";
        for (const [key, expectedValue] of Object.entries(expectedFields)) {
            if (responseBody[key] !== expectedValue) {
                failureReason += `Mismatch: ${key} Expected: ${expectedValue}, Found: ${responseBody[key]} \n`;
            }
        } return failureReason;
    }


    private async validateXMLSchema(xmlResponse: string, xmlSchema: string): Promise<boolean> {
        const validationResult = await validateXML({
          xml: xmlResponse,
          schema: xmlSchema,
        });
        const isValid=validationResult.valid;
        if (!validationResult.valid) {
          const errors = validationResult.errors?.map((e: any) => e.message || JSON.stringify(e)).join("\n") || "Unknown validation error";
          throw new Error(`XML Schema validation failed:\n${errors}`);
        }      
        return isValid;
      }
    }
//.........................
        // const xsdDoc = xmlrd.parseXml(xmlSchema);
        // const xmlParsedResponse = xmlrd.parseXml(xmlResponse);
        // const isValid = xmlParsedResponse.validate(xsdDoc);
        // if (!isValid) {
        //     const errors = xmlParsedResponse.validationErrors;
        //     const errorMessages = errors.map((err) => err.message).join("\n");
        //     throw new Error(`XML Schema validation failed:\n${errorMessages}`);
        // }
        // return isValid;
    