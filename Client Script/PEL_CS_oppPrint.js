
/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 *

 */

 define(['N/url', 'N/currentRecord'], function (nsUrl, currentRecord) {


	function pageInit(context) {
        console.log('pageInit Work','pageWork');
	}

	function printOpportunity(redId) {
        console.log('printOpportunity ->',redId.toString());
		var currentRec = currentRecord.get();
		var scriptURL = nsUrl.resolveScript({
			scriptId: 'customscript_ab_sl_print_opp_pdf',
			deploymentId: 'customdeploy_ab_sl_print_opp_pdf',
			params: {
				id: redId,
				rectype: currentRec.type
			},
			returnExternalUrl: false
		});
		newWindow = window.open(scriptURL);
	}


	return {
		pageInit: pageInit,
		printOpportunity: printOpportunity
	};
});