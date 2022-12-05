/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *
 *@Author:- Abhay Srivastava
 *@Date:- August 17, 2021
 *@Date:- January 20, 2022  Update by Arslan if Subsidiary EL Tiempo rate is 1.00
 *@Script Name:- ABY Exchange Rate On Bill
 *@Script Id:- customscript_aby_exchange_rate_on_bill
 */

define(['N/search', 'N/record', 'N/log'],
	function (search, record, log) {
		function updateExchangeRate(context) {
			try {
				if (context.type == context.UserEventType.COPY || context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
					var record = context.newRecord;
					// Get ExchangeRate value
					var exchangeRate = record.getValue({
						fieldId: 'exchangerate'
					});
					// Get CurrentExchangeRate value
					var currExchange = record.getValue({
						fieldId: 'custbody_current_fx_rate'
					});
					log.debug('DEBUG', 'ExchangeRate: ' + exchangeRate + ' || CurrentExchangeRate: ' + currExchange);
					//Get Subsidiary
					var Subsidiary = record.getValue({
						fieldId: 'subsidiary'
					});
					log.debug({
						title: 'Subsidiary',
						details: Subsidiary
					});
					if (Subsidiary == '11') {
						log.debug({
							title: 'Subsidiary is 11',
							details: Subsidiary
						});
						record.setValue({
							fieldId: 'custbody_current_fx_rate',
							value: '1.00'
						});
					} else {
						if (isNotNull(currExchange)) {
							log.debug({
								title: 'working',
								details: 'yes'
							})
							record.setValue({
								fieldId: 'exchangerate',
								value: currExchange
							});
						}
					}
				}
			} catch (e) {
				log.error('ERROR', 'FIELDCHANGED Error: ' + e.message);
			}
		}

		function isNotNull(aVal) {
			if (aVal && aVal != 'undefined' && aVal != null && aVal != '')
				return true;
			else
				return false;
		}

		return {
			beforeSubmit: updateExchangeRate
		}
	}
);