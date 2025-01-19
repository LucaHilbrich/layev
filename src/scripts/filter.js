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
    // if (this.checked) {
    //     CONFIG.COLORS.sp = setAlpha(CONFIG.COLORS.sp, 1.0);
    // } else {
    //     CONFIG.COLORS.sp = setAlpha(CONFIG.COLORS.sp, 0.0);
    // }
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxSignificantNegative.addEventListener('change', function() {
    // if (this.checked) {
    //     CONFIG.COLORS.sn = setAlpha(CONFIG.COLORS.sn, 1.0);
    // } else {
    //     CONFIG.COLORS.sn = setAlpha(CONFIG.COLORS.sn, 0.0);
    // }
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxSignificant.addEventListener('change', function() {
    // if (this.checked) {
    //     CONFIG.COLORS.s = setAlpha(CONFIG.COLORS.s, 1.0);
    // } else {
    //     CONFIG.COLORS.s = setAlpha(CONFIG.COLORS.s, 0.0);
    // }
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxAnalyzed.addEventListener('change', function() {
    // if (this.checked) {
    //     CONFIG.COLORS.a = setAlpha(CONFIG.COLORS.a, 0.4);
    // } else {
    //     CONFIG.COLORS.a = setAlpha(CONFIG.COLORS.a, 0.0);
    // }
    layeredGraph.updateLayerTextures(getChecked());
});

checkboxMeasured.addEventListener('change', function() {
    // if (this.checked) {
    //     CONFIG.COLORS.m = setAlpha(CONFIG.COLORS.m, 0.2);
    // } else {
    //     CONFIG.COLORS.m = setAlpha(CONFIG.COLORS.m, 0.0);
    // }
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