"use strict";

var tokens, trigger, replaced, corrections = {};

function init() {
    corrections = Homey.manager('settings').get('corrections');
    
    if (typeof corrections === 'object') {
        Object.keys(corrections).forEach(function (key) {
            Homey.manager('speech-input').addTrigger({
                "id": "better-voice-"+key,
                "importance": 1,
                "triggers": {
                    "en": [ key ],
                    "nl": [ key ]
                }
            });
            Homey.log("Trigger added for "+key);
         });   
    }
	
	Homey.log("Homey Better Voice app ready!");
	
}

Homey.manager('speech-input').on('speech', function(speech){
	trigger = speech.triggers[0].text;
	Homey.log('Trigger '+trigger+' detected');
	if (typeof trigger === 'string' && (trigger in corrections)) {
		Homey.log('Trigger '+trigger+' executed');
        
        replaced = speech.transcript.replace(trigger, corrections[trigger]);
        tokens = {'corrected_sentence': replaced, 'corrected_word': corrections[trigger] };
        
        Homey.manager('flow').trigger('better_voice_trigger', tokens, null, function(err, result){
            if( err ) return Homey.error(err);
        });
    }
});

module.exports.init = init;