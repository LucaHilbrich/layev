import { setAlpha } from '../three-scripts/graphicUtils.js'
import { CONFIG } from '../three-scripts/main.js';
import { updateLayerTextures } from '../three-scripts/main.js';

const checkboxReferences = document.getElementById('checkbox-r');
const checkboxNodeLabels = document.getElementById('checkbox-l');
const checkboxSignificantPositive = document.getElementById('checkbox-sp');
const checkboxSignificantNegative = document.getElementById('checkbox-sn');
const checkboxSignificant = document.getElementById('checkbox-s');
const checkboxAnalyzed = document.getElementById('checkbox-a');
const checkboxMeasured = document.getElementById('checkbox-m');

checkboxReferences.addEventListener('change', function() {
    if (this.checked) {
        console.log('References on.');
    } else {
        console.log('References off.');
    }
});

checkboxNodeLabels.addEventListener('change', function() {
    if (this.checked) {
        console.log('Node Labels on.');
    } else {
        console.log('Node Labels off.');
    }
});

checkboxSignificantPositive.addEventListener('change', function() {
    if (this.checked) {
        CONFIG.COLORS.sp = setAlpha(CONFIG.COLORS.sp, 1.0);
    } else {
        CONFIG.COLORS.sp = setAlpha(CONFIG.COLORS.sp, 0.0);
    }
    updateLayerTextures();
});

checkboxSignificantNegative.addEventListener('change', function() {
    if (this.checked) {
        CONFIG.COLORS.sn = setAlpha(CONFIG.COLORS.sn, 1.0);
    } else {
        CONFIG.COLORS.sn = setAlpha(CONFIG.COLORS.sn, 0.0);
    }
    updateLayerTextures();
});

checkboxSignificant.addEventListener('change', function() {
    if (this.checked) {
        CONFIG.COLORS.s = setAlpha(CONFIG.COLORS.s, 1.0);
    } else {
        CONFIG.COLORS.s = setAlpha(CONFIG.COLORS.s, 0.0);
    }
    updateLayerTextures();
});

checkboxAnalyzed.addEventListener('change', function() {
    if (this.checked) {
        CONFIG.COLORS.a = setAlpha(CONFIG.COLORS.a, 1.0);
    } else {
        CONFIG.COLORS.a = setAlpha(CONFIG.COLORS.a, 0.0);
    }
    updateLayerTextures();
});

checkboxMeasured.addEventListener('change', function() {
    if (this.checked) {
        CONFIG.COLORS.m = setAlpha(CONFIG.COLORS.m, 1.0);
    } else {
        CONFIG.COLORS.m = setAlpha(CONFIG.COLORS.m, 0.0);
    }
    updateLayerTextures();
});
