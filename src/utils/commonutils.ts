import PropertiesReader from 'properties-reader';
import * as crypto from 'crypto';
import fs from "fs";
import { ApiClient } from '../utils/apiClient';
import { XMLParser } from 'fast-xml-parser';


const algorithm = 'aes-256-cbc';
const key = Buffer.alloc(32).fill(0x01);
const apiClient = new ApiClient();

export enum fileName {
    Xml = "src/testData/apixmlTestData.xml",
    Json = "src/testData/apiTestData.json"
  }

export function readProperties(key: string) {
    const properties = PropertiesReader('./src/endpoints/endpoints.properties');
    return properties.get(key) as string;
}

//Read data from json

export function readTestData(testCase: string, dataFileType: string) {
    let testData: any;
   
    if(dataFileType.includes("json")){
        const rawData = fs.readFileSync("src/testData/apiTestData.json", "utf8");
        const parsedJson = JSON.parse(rawData);
        testData=parsedJson[testCase];
    } else {
      const rawData = fs.readFileSync("src/testData/apixmlTestData.xml", "utf8");
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsedXML = parser.parse(rawData);
   
      testData = parsedXML.root[testCase];
    }
   
    return testData || {};
  }

export function decryptAES265CDC(encryptedText: string): string {
    const [ivBase64, encryptedData] = encryptedText.split(':');
    const ivBuffer = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//Access Token
export async function getAccessToken(accessTokenData: string, accessTokenEndpoint: string): Promise<string> {
    //method for getting access token
    const testData = readTestData(accessTokenData ,fileName.Json);
    var response = await apiClient.sendRequest({
        method: "POST",
        url: readProperties(accessTokenEndpoint),
        expectedStatusCode: 200,
        urlEncodedBody: testData.urlEncodedBody,
    });
    const responseBody = await response.json();
    return responseBody["access_token"];
}





