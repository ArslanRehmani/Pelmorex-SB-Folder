/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/record','N/log'], function(record,log) {


    function afterSubmit(context) {
        var rec = context.newRecord;
        var recId = rec.id;
        var account = rec.getValue({
            fieldId : 'account'
        });
        log.debug({
            title: 'account',
            details: account
        });
        var PaymentOBJ = record.load({
            type: 'vendorpayment',
            id: recId
        });
        var accountOJ = record.load({
            type: 'account',
            id: account
        });
        var checkNum = accountOJ.getValue({
            fieldId: 'curdocnum'
        });
        log.debug({
            title: 'checkNum',
            details: checkNum
        });
        PaymentOBJ.setValue({
            fieldId: 'custbody4',
            value: checkNum
        });
        PaymentOBJ.setValue({
            fieldId: 'tranid',
            value: parseInt(checkNum)
        });
        var exchangerate = rec.getValue({
            fieldId : 'exchangerate'
        });
        log.debug({
            title: 'exchangerate',
            details: exchangerate
        });
        PaymentOBJ.save();
    }

    return {
        afterSubmit: afterSubmit
    }
});
