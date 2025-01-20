import { setAlpha } from '../three-scripts/graphicUtils.js'
import { CONFIG } from '../three-scripts/main.js';
import { layeredGraph } from '../three-scripts/main.js';

const checkboxReferences = document.getElementById('checkbox-r');
const checkboxNodeLabels = document.getElementById('checkbox-l');
const checkboxSignificantPositive = document.getElementById('checkbox-sp');
const checkboxSignificantNegative = document.getElementById('checkbox-sn');
const checkboxSignificant = document.getElementById('checkbox-s');
const checkboxAnalyzed = document.getElementById('checkbox-a');
const checkboxMeasured = document.getElementById('checkbox-m');

checkboxReferences.addEventListener('change', function() {
    layeredGraph.toggleReferenceLabelVisibility();
});

checkboxNodeLabels.addEventListener('change', function() {
    layeredGraph.toggleLabelVisibility();
});

checkboxSignificantPositive.addEventListener('change', function() {
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxSignificantNegative.addEventListener('change', function() {
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxSignificant.addEventListener('change', function() {
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxAnalyzed.addEventListener('change', function() {
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxMeasured.addEventListener('change', function() {
    layeredGraph.updateLayerTextures(getChecked());
});

export function getChecked() {
    let checked = [];
    if (checkboxSignificantPositive.checked) {
        checked.push('sp');
    }
    if (checkboxSignificantNegative.checked) {
        checked.push('sn');
    }
    if (checkboxSignificant.checked) {
        checked.push('s');
    }
    if (checkboxAnalyzed.checked) {
        checked.push('a');
    }
    if (checkboxMeasured.checked) {
        checked.push('m');
    }
    return checked;
}