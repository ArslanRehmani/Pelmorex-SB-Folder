/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
 define(['N/log','N/record'], function(log,record) {

    function beforeLoad(context) {
        var title = 'afterSubmit(::)';
        try{
            var rec = context.newRecord;
            log.debug({
                title: 'rec',
                details: rec
            });
            // var otherId = record.submitFields({
            //     type: 'salesorder',
            //     id: rec.id,
            //     values: {
            //         'discountitem':  '4649',
            //         'discountrate': '-20%'
            //     }
            // });
        //   var IOObj = record.load({
        //     type: 'salesorder',
        //     id: rec.id
        //   });
        //   IOObj.setValue({
        //         fieldId: 'discountrate' ,
        //         value: -20
        //     });
            // IOObj.setValue({
            //     fieldId: 'custbody_agencette' ,
            //     value: true
            // });
            // record.save(IOObj);
            // IOObj.save({
            //     enableSourcing: true,
            //     ignoreMandatoryFields: true
            // });
            // rec.setValue({
            //     fieldId: 'custbody_gam_order_number',
            //     value: 123,
            //     ignoreFieldChange: true
            // });
            // var a = rec.getValue({fieldId : 'custbody_appf_campaign_name'});
            // log.debug({
            //     title: 'a',
            //     details: a
            // });
            // record.save(rec);
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
        
    }

    return {
        beforeLoad: beforeLoad
    }
});
