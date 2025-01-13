import { makeVisualization } from "../three-scripts/main.js";

const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

const fileContents = {};

fileInput.addEventListener("change", () => {
    for (const file of fileInput.files) {
        processDotFile(file);
    }
});

function processDotFile(file) {
    addFileToFileList(file);
    readFile(file);
}

function addFileToFileList(file) {
    let li = document.createElement("li");

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "-";
    deleteButton.className = "deleteButton";
    deleteButton.addEventListener("click", () => {
        li.remove();
        delete fileContents[file.name];
        makeVisualization(fileContents);
    });

    let fileName = document.createElement("span");
    fileName.textContent = file.name;

    let visibilityToggle = document.createElement("input");
    visibilityToggle.type = "checkbox";
    visibilityToggle.checked = true;
    visibilityToggle.id = `visibilityToggle-${file.name}`;

    li.appendChild(deleteButton);
    li.appendChild(fileName);
    li.appendChild(visibilityToggle);
    fileList.appendChild(li);
}

function readFile(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        fileContents[file.name] = reader.result;
        makeVisualization(fileContents);
    });

    if (file) {
        reader.readAsText(file);
    }
}

// Upload example file on page load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const exampleFile = await fetchExampleFile();
        processDotFile(exampleFile);
    } catch (error) {
        console.error("Failed to load the example file:", error);
    }
});

async function fetchExampleFile() {
    let filePath = '../assets/example.dot';
    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Error fetching file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const fileName = filePath.split("/").pop();
    return new File([blob], fileName);
}
