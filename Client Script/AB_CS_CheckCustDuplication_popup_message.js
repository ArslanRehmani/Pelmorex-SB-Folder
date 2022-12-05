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
* File:		    AB_CS_CheckCustDuplication_popup_message.js
* Date:		    08/04 /2022
************************************************************************/
/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 define(['N/log', 'N/record', 'N/ui/dialog', 'N/search'], function (log, record, dialog, search) {

/** 
 * This function exicute on field changed only when 'companyname' is changed and show pop up duplication is not allowed
 * 
 * @author marslan@AlphaBOLDconsultants.com 
 * @param [string] params 
 * @param {object} context 
 * @return null 
 * 
*/ 

    function fieldChanged(context) {
        var title = 'fieldChanged()::';
        try {
            var rec = context.currentRecord;
            var fieldId = context.fieldId;
            if (fieldId == 'companyname') {
                var companyNamefieldChanged = rec.getValue({
                    fieldId: 'companyname'
                });
                log.debug('companyNamefieldChanged', companyNamefieldChanged);
                if (companyNamefieldChanged) {
                    var count = checkDuplication(companyNamefieldChanged)
                    if (count != 0) {
                        dialog.create({
                            title: '<span style="background-color: red;">STOP ?</span>',
                            message: '<b style="background-color: red;color: white;">Customer Already Exist. Duplicate Customers Not Allowed! Press OK to Avoid Duplication</b>'
                        }).then(function (option) {
                            if (option) {
                                rec.setValue({
                                    fieldId: 'companyname',
                                    value: '',
                                    ignoreFieldChange: true
                                });
                            }
                        }).catch(function (e) {
                            throw new Error('ERROR', e.message);
                        });
                    }

                }
            }
        } catch (e) {
            log.debug({
                title: title + e.error,
                details: e.message
            });
        }
    }
/** 
 * This function exicute on saveRecord only when 'companyname' is duplicate and show pop up duplication is not allowed
 * 
 * @author marslan@AlphaBOLDconsultants.com 
 * @param [string] params 
 * @param {object} context 
 * @return null 
 * 
*/ 
    function saveRecord(context) {
            var title = 'saveRecord()::';
        try {
            var rec = context.currentRecord;
            var currentRecIDExit = context.currentRecord.id;
            log.debug('currentRecIDExit Id', currentRecIDExit);
             if(currentRecIDExit){
               return true;
             }
            var companyNamesaveRecord = rec.getValue({
                fieldId: 'companyname'
            });
            log.debug('companyNamesaveRecord', companyNamesaveRecord);
            if (companyNamesaveRecord) {
                var count = checkDuplication(companyNamesaveRecord)
                    if (count != 0) {
                    dialog.create({
                        title: '<span style="background-color: red;">STOP ?</span>',
                        message: '<b style="background-color: red;">Customer Already Exist. Duplicate Customers Not Allowed!</b>'
                    }).then(function (option) {
                        if (option) {
                            rec.setValue({
                                fieldId: 'companyname',
                                value: '',
                                ignoreFieldChange: true
                            });
                        }
                    }).catch(function (e) {
                        throw new Error('ERROR', e.message);
                    });
                }else {
                    return true;
                }

            }

        } catch (e) {
            log.debug({
                title: title + e.error,
                details: e.message
            });
        }
        
    }
/** 
 * This function 'checkDuplication' return is any duplicate customer exist in NetSuite
 * 
 * @author marslan@AlphaBOLDconsultants.com 
 * @param [string] params 
 * @param {object} companyName 
 * @return searchResultCount 
 * 
*/
    function checkDuplication(companyName) {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
                ["companyname", "contains", companyName]
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
        return searchResultCount;
    }
    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    }
});
