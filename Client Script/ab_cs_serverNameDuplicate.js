/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
// eslint-disable-next-line no-undef
define(['N/log', 'N/search', 'N/record', 'N/error','N/ui/dialog'], function(log, search, record, error,dialog) {

    function pageInit(context) {
        var title = 'pageInit()::';
         try{
           log.debug(title+'pageinit','Working')
            var rec = context.currentRecord;
            var serverName = rec.getValue({
                fieldId: 'name'
            });
            if(serverName){
                var recId = rec.id || '';
                if (checkDuplication(serverName, recId)) {
                    //Duplication Exist
                    dialog.alert({
                        title: "ERROR: Server Name Duplication",
                        message: "Server Name :"+serverName+" Already Exists"
                    });
                    rec.setValue({
                        fieldId: 'name',
                        value : ''
                    });
                }
            }
            }catch(error){
                 log.error(title+error.name,error.message);
        } 
    }

   
    function fieldChanged(context) {
        var title = 'fieldChanged()::';
         try{
            var rec = context.currentRecord;
            var fieldId = context.fieldId;
            if(fieldId == 'name'){
                var recId = rec.id || '';
                var serverName = rec.getValue({
                    fieldId: 'name'
                });
                if (checkDuplication(serverName, recId)) {
                    //Duplication Exist
                    dialog.alert({
                        title: "ERROR: Server Name Duplication",
                        message: "Server Name :"+serverName+" Already Exists"
                    });
                    rec.setValue({
                        fieldId: 'name',
                        value : ''
                    });
                }
            }
            }catch(error){
                 log.error(title+error.name,error.message); 
        } 
    }
    function checkDuplication(ServerName, recId) {
        var title = 'checkDuplication()::';
        try {
            var customrecord_cap_server_custSearchObj = search.create({
                type: "customrecord_cap_server_cust",
                filters: [
                    search.createFilter({
                        name: 'name',
                        operator: search.Operator.IS,
                        values: ServerName
                    })
                ],
                columns: [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
            });
            log.debug(title + 'recId', recId);
            if (recId) {
                var searchfilters = customrecord_cap_server_custSearchObj.filters;
                searchfilters = searchfilters.concat(search.createFilter({
                    name: 'internalid',
                    operator: 'noneof',
                    values: recId
                }));
                customrecord_cap_server_custSearchObj.filters = searchfilters;
            }


            var resultSet = customrecord_cap_server_custSearchObj.run().getRange({
                start: 0,
                end: 1
            });
            if (resultSet.length) {
                //duplicate Exist
                return true;
            } else {
                //No duplicate Server name Exist
                return false;
            }

        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }
  
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
       
    };
});
