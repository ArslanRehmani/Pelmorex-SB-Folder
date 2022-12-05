/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/search', 'N/email'],
    /**
   * @param{log} log
   * @param{record} record
   * @param{search} search
   */
    function (log, record, search, email) {

        function afterSubmit(context) {
            var title = 'afterSubmit(::)';
            try {
                var companyObj;
                var CompanyName = '';
                var rec = context.newRecord;
                var multiSelectArray = rec.getValue({
                    fieldId: 'custevent_additional_assignees'
                });
                log.debug({
                    title: 'multiSelectArray',
                    details: multiSelectArray
                });
                var ownerId = rec.getValue({
                    fieldId: 'owner'
                });
                var employeeObj = record.load({
                    type: record.Type.EMPLOYEE,
                    id: ownerId
                });
                var EmpName = employeeObj.getValue({ fieldId: 'entityid' });
                var taskTitle = rec.getValue({
                    fieldId: 'title'
                });
                var taskPriority = rec.getValue({
                    fieldId: 'priority'
                });
                var taskStatus = rec.getValue({
                    fieldId: 'status'
                });
                var startDate = rec.getValue({
                    fieldId: 'startdate'
                });
                var taskStartDate = formateDate(startDate);
                var duetDate = rec.getValue({
                    fieldId: 'duedate'
                });
                var taskDueDate = formateDate(duetDate);
                var notifyEmail = rec.getValue({
                    fieldId: 'sendemail'
                });
                var companyId = rec.getValue({
                    fieldId: 'company'
                });
                var assignedTo = rec.getValue({
                    fieldId: 'assigned'
                });
                if (companyId) {
                    companyObj = record.load({
                        type: record.Type.CUSTOMER,
                        id: companyId
                    });
                    CompanyName = companyObj.getValue({ fieldId: 'companyname' });
                    if(!CompanyName){
                        CompanyName = '';
                    }
                }
                if (context.type === context.UserEventType.CREATE) {
                    if ((multiSelectArray && multiSelectArray.length) && (notifyEmail == 'true' || notifyEmail == true)) {
                        email.send({
                            author: ownerId,
                            recipients: assignedTo,
                            cc: multiSelectArray,
                            subject: "Task is " + taskStatus + "",
                            body: 'The following task has been assigned to you by ' + EmpName + ' in Pelmorex Corp. <br /> <br />\
                            Information regarding the task has been posted below.<br />\
                            To view the task record, log in to NetSuite then navigate to: https://4506264-sb2.app.netsuite.com/app/crm/calendar/task.nl?id='+ rec.id + ' <br /> <br />\
                            <b>Task:</b> '+ taskTitle + '<br />\
                            <b>Priority:</b> '+ taskPriority + '<br />\
                            <b>Status:</b> '+ taskStatus + '<br />\
                            <b>Start Date:</b> '+ taskStartDate + '<br />\
                            <b>Due Date:</b> '+ taskDueDate + '<br />\
                            <b>Associated companies, contacts:</b> '+ CompanyName + ''
                        });
                    }
                } else {
                    var oldRec = context.oldRecord;
                    var oldStatus = oldRec.getValue({ fieldId: 'status' });
                    if ((multiSelectArray && multiSelectArray.length) && ((notifyEmail == 'true' || notifyEmail == true) || (oldStatus != taskStatus))) {
                        // if (taskStatus == 'COMPLETE' || taskStatus == 'PROGRESS') {
                            email.send({
                                author: ownerId,
                                recipients: assignedTo,
                                cc: multiSelectArray,
                                subject: "Task is " + taskStatus + "",
                                body: 'The following task is ' + taskStatus + '. <br /> <br />\
                                Information regarding the task has been posted below.<br />\
                                To view the task record, log in to NetSuite then navigate to: https://4506264-sb2.app.netsuite.com/app/crm/calendar/task.nl?id='+ rec.id + ' <br /> <br />\
                                <b>Task:</b> '+ taskTitle + '<br />\
                                <b>Priority:</b> '+ taskPriority + '<br />\
                                <b>Status:</b> '+ taskStatus + '<br />\
                                <b>Start Date:</b> '+ taskStartDate + '<br />\
                                <b>Due Date:</b> '+ taskDueDate + '<br />\
                                <b>Associated companies, contacts:</b> '+ CompanyName + ''
                            });
                    }
                }
            } catch (e) {
                log.debug('Exception ' + title, e.message);
            }
        }
        function formateDate(trandate) {
            var date = new Date(trandate);
            var day = date.getDay();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var formateDate = month + '/' + day + '/' + year;
            return formateDate;

        }
        return {
            afterSubmit: afterSubmit
        }
    });
