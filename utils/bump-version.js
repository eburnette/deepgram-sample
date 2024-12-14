// Script to increment the patch version number in package.json and manifest.json
// Usage: run this from the main project directory:
//    node ./utils/bump-version.js
const fs = require('fs');
const path = require('path');

// Function to increment the patch version
function incrementPatchVersion(version) {
    const versionParts = version.split('.');
    const patch = parseInt(versionParts[2], 10) + 1;
    return `${versionParts[0]}.${versionParts[1]}.${patch}`;
}

// Function to read the version from a JSON file
function readVersion(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonContent = JSON.parse(fileContent);
    return jsonContent.version;
}

// Function to update the version in a JSON file
function updateVersion(filePath, newVersion) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonContent = JSON.parse(fileContent);
    jsonContent.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log(`Updated version in ${filePath} to ${newVersion}`);
}

// Paths to the JSON files
const packageJsonPath = path.join('package.json');
const manifestJsonPath = path.join('src', 'manifest.json');

// Read the versions from both files
const packageVersion = readVersion(packageJsonPath);
const manifestVersion = readVersion(manifestJsonPath);

// Check if the versions are the same
if (packageVersion !== manifestVersion) {
    console.error('Error: Versions in package.json and src/manifest.json are different.');
    console.error(`package.json version: ${packageVersion}`);
    console.error(`src/manifest.json version: ${manifestVersion}`);
    process.exit(1);
}

// Increment the version
const newVersion = incrementPatchVersion(packageVersion);

// Update the version in both files
updateVersion(packageJsonPath, newVersion);
updateVersion(manifestJsonPath, newVersion);