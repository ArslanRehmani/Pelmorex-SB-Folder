/*
***********************************************************************
*
* The following javascript code is created by ALPHABOLD Consultants LLC,
* a NetSuite Partner. It is a SuiteFlex component containing custom code
* intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
* The code is provided "as is": ALPHABOLD Inc. shall not be liable
* for any damages arising out the intended use or if the code is modified
* after delivery.
*
* Company:		ALPHABOLD Consultants LLC, www.AlphaBOLDconsultants.com
* Author:		marslan@AlphaBOLD.com
* File:		AB_UE_CheckCustDuplication_popup_message.js
* Date:		06/20/2022
************************************************************************/
/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/ui/dialog', 'N/search'], function (log, record, dialog, search) {

    function beforeSubmit(context) {
        var title = 'beforeSubmit::()';
        try {
            var rec = context.newRecord;
            var companyName = rec.getValue({
                fieldId: 'companyname'
            });
            log.debug('companyName', companyName);
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["hasduplicates", "is", "F"],
                        "AND",
                        ["entityid", "contains", companyName]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            log.debug('searchResultCount', searchResultCount);
            if (searchResultCount != 0) {
                // alert("This Customer Already Exist",searchResultCount);
                confirm("Press a button!");
                log.debug('alert testing','testing');
                // dialog.confirm({
                //     title: 'WARNING ?',
                //     message: '<b>Found Duplicate Customer. Press OK to Proceed OR Press Cancle to go Back</b>'
                // }).then(function (option) {
                //     if (!option) {
                //         rec.setValue({
                //             fieldId: 'companyname',
                //             value: '',
                //             ignoreFieldChange: true
                //         });
                //     }
                // }).catch(function (e) {
                //     throw new Error('ERROR', e.message);
                // });
            }
        } catch (e) {
            log.debug({
                title: title + e.error,
                details: e.message
            });
        }
    }
    return {
        beforeSubmit: beforeSubmit
    }
});
