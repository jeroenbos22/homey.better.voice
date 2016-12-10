"use strict";

var tokens, trigger, replaced, corrections = {};
var combine_array = [];

function setupTriggers() {
    if (Homey.manager('settings').get('combinations') == 1) {
        Homey.log("Use combinations, add trigger");
        Homey.manager('speech-input').addTrigger({
            "id": "better-voice-combinations-trigger",
            "importance": 1,
            "triggers": {
                "en": ["and"],
                "nl": ["en"]
            }
        });
    } else {
        Homey.manager('speech-input').removeTrigger('better-voice-combinations-trigger');
        Homey.log("Not use combinations, remove trigger");
    }
    
    corrections = Homey.manager('settings').get('corrections');
    if (typeof corrections === 'object') {
        Object.keys(corrections).forEach(function (key) {
            Homey.manager('speech-input').addTrigger({
                "id": "better-voice-" + key,
                "importance": 1,
                "triggers": {
                    "en": [key],
                    "nl": [key]
                }
            });
            Homey.log("Trigger added for " + key);
        });
    }
}

function init() {
    setupTriggers();

    Homey.log("Homey Better Voice app ready!");
}

Homey.manager('settings').on('set', function (setting) {
    if (setting !== 'corrections') {
        return;
    }
    setupTriggers();
});

Homey.manager('speech-input').on('speech', function (speech) {
    trigger = speech.triggers[0].text;
    Homey.log('Trigger ' + trigger + ' detected');
    if (typeof trigger === 'string' && (trigger in corrections)) {
        Homey.log('Trigger ' + trigger + ' executed');

        replaced = speech.transcript.replace(trigger, corrections[trigger]);
        tokens = {'corrected_sentence': replaced, 'corrected_word': corrections[trigger]};

        Homey.manager('flow').trigger('better_voice_trigger', tokens, {session: speech.session}, function (err, result) {
            if (err) return Homey.error(err);
        });
    } else {
        replaced = speech.transcript;
    }
    
    if (typeof trigger === 'string' && (trigger === "and" || trigger === "en")) {
        if (Homey.manager('i18n').getLanguage() == 'nl') {
            combine_array = replaced.split(" en ",3); // If ducth find " en "
        } else {
            combine_array = replaced.split(" and ",3); // If other find " and "
        }
        
        for (var key in combine_array) {
            combine_array[key] = combine_array[key].replace('and',' ').replace('en',' ').trim();
        }
        
        tokens = {'combine_1': combine_array[0], 'combine_2': combine_array[1], 'combine_3': combine_array[2]};
        
        Homey.log(tokens);

        Homey.manager('flow').trigger('better_voice_combine', tokens, {session: speech.session}, function (err, result) {
            if (err) return Homey.error(err);
        });
        
        
    }
});

module.exports.init = init;
