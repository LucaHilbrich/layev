import { addToVisualization, removeFromVisualization } from "../three-scripts/main.js";

const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const uploadedFiles = new Set();

fileInput.addEventListener("change", () => {
    for (const file of fileInput.files) {
        if (uploadedFiles.has(file.name)) {
            alert(`The file "${file.name}" is already uploaded.`);
        } else {
            processDotFile(file);
        }
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
        removeFromVisualization(file.name);
        uploadedFiles.delete(file.name);
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

    uploadedFiles.add(file.name);
}

function readFile(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        addToVisualization(file.name, reader.result);
    });

    if (file) {
        reader.readAsText(file);
    }
}

// Upload example file on page load

document.getElementById("loadExample").addEventListener("click", async () => {
    const filePaths = [
        // '../assets/schematic_a.dot',

        '../assets/bangay_preston_1998.dot',
        '../assets/busscher_etal_2011.dot',
        '../assets/cooper_etal_2015.dot',
        '../assets/kim_etal_2005.dot',
        // '../assets/knight_arns_2006.dot',
        // '../assets/lin_etal_2002.dot',
        // '../assets/ling_etal_2013.dot',
        // '../assets/liu_uang_2011.dot',
        // '../assets/mania_chalmers_2001.dot',
        // '../assets/milleville-pennel_charron_2015.dot',
        // '../assets/nichols_etal_2000.dot',
        // '../assets/robillard_etal_2003.dot',
        // '../assets/ryan_griffin_2016.dot',
        // '../assets/seay_etal_2002.dot',
        // '../assets/usoh_etal_1999.dot',
        // '../assets/witmer_etal_1996.dot',
        // '../assets/witmer_singer_1998.dot'
    ];

    for (let f of filePaths) {
        try {
            const file = await fetchFile(f);
            if (!uploadedFiles.has(file.name)) {
                processDotFile(file);
            }
        } catch (error) {
            console.error("Failed to load the example file:", error);
        }
    }
});


document.addEventListener("DOMContentLoaded", async () => {
});

async function fetchFile(filePath) {
    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Error fetching file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const fileName = filePath.split("/").pop();
    return new File([blob], fileName);
}
