const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

// Sample file that is already uploaded in the assets folder
const exampleFile = {
    name: "example.dot", // Replace with the actual file name in your assets folder
    path: "../assets/example.dot" // This is the relative path to your assets folder
};

// Add the example file to the list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addFileToFileList(exampleFile, true); // 'true' to mark it as already uploaded
});

fileInput.addEventListener("change", () => {
    for (const file of fileInput.files) {
        addFileToFileList(file);
    }
});

function addFileToFileList(file, isExample = false) {
    let li = document.createElement("li");

    let deleteButton = document.createElement('button');
    deleteButton.textContent = '-';
    deleteButton.className = 'deleteButton';
    deleteButton.addEventListener('click', () => {
        li.remove();
    });

    let visibilityToggle = document.createElement('input');
    visibilityToggle.type = 'checkbox';
    visibilityToggle.checked = true;
    visibilityToggle.id = `visibilityToggle-${file.name}`;

    let fileName = document.createElement('span');
    fileName.textContent = file.name;

    li.appendChild(deleteButton);
    li.appendChild(fileName);
    li.appendChild(visibilityToggle);
    fileList.appendChild(li);
}
