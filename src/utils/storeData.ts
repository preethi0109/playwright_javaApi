import fs from "fs";
 
const filePath = "src/testData/apiTestData.json"; // File to store the data
 
// Function to save data
export function saveData(key: string, value: any) {
    let data: Record<string, any> = {};
 
    // Read existing data if the file exists
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        data = JSON.parse(fileContent);
    }
 
    data[key] = value; // Update the key-value pair
 
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Write back to file
}
 