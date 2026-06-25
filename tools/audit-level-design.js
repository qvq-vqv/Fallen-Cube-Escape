#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'levels.js'), 'utf8'), context, { filename: 'levels.js' });

const levels = context.window.createLevelBook();

function textOf(field) {
    if (field && typeof field === 'object') {
        return field.zh || field.en || '';
    }
    return field || '';
}
const strict = process.argv.includes('--strict');
const targetCount = 100;

function validationKeys(level) {
    return Object.entries(level.validation || {})
        .filter(([, value]) => value === true)
        .map(([key]) => key)
        .sort()
        .join('+') || 'none';
}

function designFingerprint(level) {
    const enemies = (level.ais || [])
        .map(ai => ai.type)
        .sort()
        .join('+') || 'none';
    return [
        `N${level.size || 3}`,
        `act${level.act || 1}`,
        (level.mechanicTags || []).join('+') || 'basic',
        `enemy:${enemies}`,
        `aggro:${level.guardianAggro || 'none'}`,
        `visual:${level.tutorial?.visual || 'none'}`,
        `validation:${validationKeys(level)}`,
        `bridge:${level.bridges?.length || 0}`,
        `void:${level.voids?.length || 0}`,
        `patch:${level.patchCharges || 0}`,
        `beacon:${level.beaconCharges || 0}`
    ].join('|');
}

function countBy(items, getKey) {
    return items.reduce((acc, item) => {
        const key = getKey(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

const requiredFields = ['id', 'number', 'act', 'title', 'chapter', 'concept', 'tutorial', 'mechanicTags', 'difficulty', 'fingerprint'];
const missingMetadata = [];
const duplicateNumbers = [];
const duplicateFingerprints = [];
const weakToolLevels = [];
const softWarnings = [];

const numberCounts = countBy(levels, level => level.number);
Object.entries(numberCounts)
    .filter(([, count]) => count > 1)
    .forEach(([number]) => duplicateNumbers.push(`L${String(number).padStart(2, '0')}`));

const fingerprintMap = new Map();
levels.forEach(level => {
    requiredFields.forEach(field => {
        if (level[field] === undefined || level[field] === null || level[field] === '') {
            missingMetadata.push(`${textOf(level.title)}: missing ${field}`);
        }
    });

    const fingerprint = designFingerprint(level);
    const existing = fingerprintMap.get(fingerprint) || [];
    existing.push(textOf(level.title));
    fingerprintMap.set(fingerprint, existing);

    const validation = level.validation || {};
    if (validation.bridgeTool && !validation.minBridgeTurnGain) {
        softWarnings.push(`${textOf(level.title)}: bridgeTool has no minBridgeTurnGain target`);
    }
    if (validation.patchTool && !validation.minPatchTurnGain) {
        softWarnings.push(`${textOf(level.title)}: patchTool has no minPatchTurnGain target`);
    }
    if (validation.beaconTool && !validation.minBeaconTurnGain) {
        softWarnings.push(`${textOf(level.title)}: beaconTool has no minBeaconTurnGain target`);
    }
    if (validation.patchTool && !level.patchCharges) {
        weakToolLevels.push(`${textOf(level.title)}: patchTool validation without patchCharges`);
    }
    if (validation.beaconTool && !level.beaconCharges) {
        weakToolLevels.push(`${textOf(level.title)}: beaconTool validation without beaconCharges`);
    }
    if ((level.mechanicTags || []).length === 0) {
        missingMetadata.push(`${textOf(level.title)}: empty mechanicTags`);
    }
});

fingerprintMap.forEach(titles => {
    if (titles.length > 1) duplicateFingerprints.push(titles.join(' / '));
});

const acts = Object.entries(countBy(levels, level => level.act || 1))
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([act, count]) => ({ act: Number(act), count }));

const report = {
    levelCount: levels.length,
    targetCount,
    completion: `${levels.length}/${targetCount}`,
    acts,
    metadataOk: missingMetadata.length === 0,
    duplicateNumbers,
    duplicateFingerprints,
    weakToolLevels,
    softWarnings,
    nextMilestone: levels.length < 40 ? 'Build Act 2 to L40' :
        (levels.length < 60 ? 'Build Act 3 to L60' :
            (levels.length < 80 ? 'Build Act 4 to L80' : 'Build Act 5 to L100'))
};

console.log(JSON.stringify(report, null, 2));

const failures = [
    ...missingMetadata,
    ...duplicateNumbers.map(number => `${number}: duplicate level number`),
    ...duplicateFingerprints.map(group => `duplicate design fingerprint: ${group}`),
    ...weakToolLevels
];

if (strict && levels.length < targetCount) {
    failures.push(`target level count not reached: ${levels.length}/${targetCount}`);
}

if (failures.length > 0) {
    console.error('\nDesign audit failures:');
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}
