/**
 * Copyright © 2017, 2020 Oracle and/or its affiliates.
 *
 * @NScriptType mapreducescript
 * @NAPIVersion 2.1
 */

define([
    '../adapter/fam_adapter_cache',
    '../adapter/fam_adapter_error',
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_runtime',
    '../adapter/fam_adapter_search',
    '../adapter/fam_adapter_task',
    '../const/fam_const_customlist',
    '../lib/fam_lib_depreciation',
    '../util/fam_util_accounting',
    '../util/fam_util_array',
    '../util/fam_util_assetvalues',
    '../util/fam_util_envcfg',
    '../util/fam_util_error',
    '../util/fam_util_fprparams',
    '../util/fam_util_log',
    '../util/fam_util_precompute',
    '../util/fam_util_process',
    '../util/fam_util_search',
    '../util/fam_util_summaryhash',
    '../util/fam_util_systemsetup',
    '../util/fam_util_tranfieldmap',
    '../util/fam_util_translator'
], getPreCalcMr);

function getPreCalcMr(cache, error, formatter, record, runtime, search, task, constList,
    libDepreciation, utilAccounting, utilArr, utilAssetVals, utilEnv, utilError, utilFprParams, utilLog, utilPreCompute,
    utilProcess, utilSearch, utilSummaryHash, utilSetup, utilTFMap, utilTranslator) {

    const SLAVE_ID_LIST_KEY = 'slaveIds',
        RERUN_SLAVE_LIST_KEY = 'rerunSlaveIds',
        JOURNAL_ID_LIST_KEY = 'journalIds',
        GROUPINFO_CACHE = 'groupInfoCache',
        CSEG_PREFIX = 'cseg';

    var assetDetails = {
        type : 'customrecord_ncfar_asset',
        columns : {
            name                          : '',
            altname                       : '',
            custrecord_assetcost          : 'origCost',
            custrecord_assetresidualvalue : 'resValue',
            custrecord_assetlifetime      : 'lifetime',
            custrecord_assetfinancialyear : 'fiscalYr',
            custrecord_assetlastdepramt   : 'lastDepAmt',
            custrecord_assetpriornbv      : 'priorNBV',
            custrecord_assetdeprtodate    : 'cumDepr',
            custrecord_assetdeprenddate   : 'deprEnd',
            custrecord_assetcurrentcost   : 'currCost',
            custrecord_assetdeprstartdate : 'deprStart',
            custrecord_assetannualentry   : 'annualMet',
            custrecord_assetcurrentage    : 'lastPeriod',
            custrecord_assetbookvalue     : 'currNBV',
            custrecord_assetsubsidiary    : 'subsidiary',
            custrecord_assettype          : 'assetType',
            custrecord_ncfar_quantity     : 'quantity',
            custrecord_assetdeprrules     : 'deprRule',
            custrecord_assetlastdeprdate  : 'lastDate',
            custrecord_assetaccmethod     : 'deprMethod',
            custrecord_assetdeprperiod    : 'deprPeriod',
            custrecord_assetcurrency      : 'currId',
            custrecord_assetdepartment    : 'depId',
            custrecord_assetclass         : 'classId',
            custrecord_assetlocation      : 'locId',
            custrecord_assetdepracc       : 'depAcct',
            custrecord_assetdeprchargeacc : 'chargeAcct',
            custrecord_assetproject       : 'projectId',
            custrecord_assetlifeunits     : 'lifeUsage',
            custrecord_assetstatus        : '',
            custrecord_assetrepairmaintcategory : 'repMainCat',
            custrecord_assetrepairmaintsubcategory : 'repSubA',
            custrecord_assetparent       : 'parentId',
            'custrecord_assetsubsidiary.isinactive' : 'subsInactive',
            'custrecord_assetdepracc.isinactive'       : 'depAcctInactive',
            'custrecord_assetdeprchargeacc.isinactive' : 'chargeAcctInactive',
            custrecord_assetvals          : 'assetVals'
        },
        cseg : null
    },
    taxDetails = {
        type : 'customrecord_ncfar_altdepreciation',
        columns : {
            custrecord_altdeprasset                                   : 'assetId',
            custrecord_altdepr_originalcost                           : 'origCost',
            'custrecord_altdeprasset.custrecord_assetleaseinitialcost': '',
            'custrecord_altdeprasset.custrecord_ncfar_quantity'       : 'quantity',
            'custrecord_altdeprasset.custrecord_assetproject'         : 'projectId',
            custrecord_altdeprrv                                      : 'resValue',
            custrecord_altdeprlifetime                                : 'lifetime',
            custrecord_altdeprfinancialyear                           : 'fiscalYr',
            custrecord_altdeprld                                      : 'lastDepAmt',
            custrecord_altdeprpriornbv                                : 'priorNBV',
            custrecord_altdeprcd                                      : 'cumDepr',
            custrecord_altdepr_deprenddate                            : 'deprEnd',
            custrecord_altdepr_currentcost                            : 'currCost',
            custrecord_altdeprstartdeprdate                           : 'deprStart',
            custrecord_altdeprannualentry                             : 'annualMet',
            custrecord_altdeprcurrentage                              : 'lastPeriod',
            custrecord_altdeprnbv                                     : 'currNBV',
            custrecord_altdepr_subsidiary                             : 'subsidiary',
            custrecord_altdepr_accountingbook                         : 'bookId',
            custrecord_altdepr_isposting                              : 'isPosting',
            custrecord_altdepr_assettype                              : 'assetType',
            custrecord_altdepr_deprrules                              : 'deprRule',
            custrecord_altdeprlastdeprdate                            : 'lastDate',
            custrecord_altdeprmethod                                  : 'deprMethod',
            custrecord_altdepr_depreciationperiod                     : 'deprPeriod',
            custrecord_altdepr_currency                               : 'currId',
            custrecord_altdepr_depraccount                            : 'depAcct',
            custrecord_altdepr_chargeaccount                          : 'chargeAcct',
            custrecord_altdeprstatus                                  : 'status',
            custrecord_altdepraltmethod                               : 'altMethod',
            'custrecord_altdeprasset.custrecord_assetdepartment'      : 'depId',
            'custrecord_altdeprasset.custrecord_assetclass'           : 'classId',
            'custrecord_altdeprasset.custrecord_assetlocation'        : 'locId',
            'custrecord_altdeprasset.custrecord_assetrepairmaintcategory' : 'repMainCat',
            'custrecord_altdeprasset.custrecord_assetrepairmaintsubcategory' : 'repSubA',
            'custrecord_altdeprasset.custrecord_assetparent'          : 'parentId',
            'custrecord_altdeprasset.custrecord_assetlifeunits'       : 'lifeUsage',
            custrecord_altdepr_groupdepreciation                      : 'isGrpDepr',
            custrecord_altdepr_groupmaster                            : 'isGrpMaster',
            'custrecord_altdepr_currency.isinactive'                  : 'currInactive', // currency is saved only in tax method
            'custrecord_altdepr_accountingbook.status'                : 'bookInactive', // to check if tax method book is deactivated
            'custrecord_altdepr_subsidiary.isinactive'                : 'subsInactive',
            'custrecord_altdepr_depraccount.isinactive'               : 'depAcctInactive',
            'custrecord_altdepr_chargeaccount.isinactive'             : 'chargeAcctInactive',
            'custrecord_altdepr_assetvals'                            : 'assetVals',
            custrecord_altdeprconvention                              : 'convention',
            custrecord_altdeprperiodconvention                        : 'periodCon',
            custrecord_altdepr_dotationaccount                        : 'dotationAcct',
            custrecord_altdepr_reintegaccount                         : 'reintegAcct',
            custrecord_altdepr_accdepraccount                         : 'accDeprAcct'
        },
        cseg : null
    },
    commonInactiveFields = {
            'custrecord_assetdepartment.isinactive'    : 'depInactive',
            'custrecord_assetclass.isinactive'         : 'classInactive',
            'custrecord_assetlocation.isinactive'      : 'locInactive',
            'custrecord_assetproject.isinactive'       : 'projectInactive',
            'custrecord_assettype.isinactive'          : 'assetTypeInactive',
            'custrecord_assetparent.isinactive'        : 'parentInactive',
            'custrecord_assetrepairmaintcategory.isinactive' : 'repMainCatInactive',
            'custrecord_assetrepairmaintsubcategory.isinactive' : 'repSubAInactive'
    };
    var module = {};
    /**
     * Returns the search object to retrieve asset slave records for precalc. It is based
     * on 4 optional script parameters:
     * - max slave id
     * - asset type
     * - subsidiary
     * - pre-calc max date
     * Set process state
     *
     * @returns {Object} search object to be used for processing
     */
    module.getInputData = function() {
        var searchObj = [];
        var scriptParams = this.getScriptParams();

        utilLog.debug('getInputData - script params', scriptParams);
        try {
            utilProcess.Stage.start({fprId: scriptParams.fprId});  // set sub-process to in-progress
            if (scriptParams.recsToProcess){
                var recIDs = scriptParams.recsToProcess.split(',');
                if (recIDs.length == 0){
                    log.audit('getInputData for specific records', 'No records to process');
                    return searchObj;
                }
                scriptParams.recsToProcess = recIDs;
            }
            else {
                if (!this.validateParams(scriptParams)){
                    return searchObj;
                }
            }
            searchObj = this.buildSearchObj(scriptParams);
        }
        catch(ex) {
            utilLog.error('getInputData', 'error occurred: ' + JSON.stringify(ex));
        }
        return searchObj;
    };

    /**
     * Pre-calculate depreciation values for an asset by:
     * - Loading values from asset record necessary for computation
     * - Loading last computed DHR to get the last known NBV and period
     * - Use values to compute for depreciation values up to pre-calc max date or end of life
     * - Set the computed values to DHR records under the asset slave via sublist operation
     * - Write the hash string for each period + group combination as a key for reduce, with value ' '
     *
     * @param {Object} context - key = search result array index, value = asset slave search result
     */
    module.map = function(context) {
        utilLog.debug('map parameters', 'key: ' + context.key + ' | value: ' + context.value);

        var assetId = 0,
            parentRecordId = null,
            parentRecordType = null,
            isConsolidated = true,
            isTax = false,
            groupInfo = {},
            valueObj = JSON.parse(context.value),
            slaveId = valueObj.id,
            scriptParams = this.getScriptParams(),
            ondemand = scriptParams.ondemand,
            subsidiaries = scriptParams.subs,
            date = scriptParams.date,
            recsToProcess = scriptParams.recsToProcess;

        try {
            var slaveFields = this.getSlaveFields(slaveId);
            utilLog.debug('to process', 'asset slave id: ' + slaveId +
                    ', asset: ' + slaveFields.asset +
                    ', tax: ' + slaveFields.tax +
                    ', forecast date: ' + slaveFields.lastForecastDate);
            context.write(SLAVE_ID_LIST_KEY, +valueObj.id);

            if (slaveFields.tax){
                parentRecordId = slaveFields.tax;
                parentRecordType = taxDetails.type;
                isTax = true;
            }
            else{
                parentRecordId   = slaveFields.asset;
                parentRecordType = assetDetails.type;
            }

            // Will precompute based on precalc parameters
            if (null == assetDetails.cseg){
                this.setCsegFields();
            }
            var fields = this.getFieldsForPrecalc(parentRecordId, isTax);
            var deprStartDate = null;
            var deprEndDate = null;
            if (fields) {
                // skip if asset values set on asset/tax is not the same as slave id
                var assetValsId = 0;
                var assetVals = isTax ? fields.custrecord_altdepr_assetvals : fields.custrecord_assetvals;
                if (assetVals && assetVals[0] && assetVals[0].value) {
                    assetValsId = assetVals[0].value;
                }
                if (+assetValsId !== +slaveId) {
                    utilAssetVals.deleteAssetValue(+slaveId);
                    utilLog.audit('deleted unlinked asset values record - different asset values set on asset/tax method',
                        'slave on asset/tax method: ' + assetValsId + ', slave id: ' + slaveId);
                    return;
                }

                var recordObj = this.buildObjectForDepreciation(fields, slaveFields, isTax);

                if (recsToProcess){
                    recsToProcess = recsToProcess.split(',');
                    assetId = slaveFields.asset;
                    log.debug('Will process record specific precomputation', 'Slave ID='+slaveId+', Date=' + date);
                    isConsolidated = false;
                    this.editDHRname({
                        slaveId : slaveId,
                        lastDate : slaveFields.lastDate,
                        lastForecastDate : slaveFields.lastForecastDate,
                        date : date,
                        assetId : assetId,
                        isPosting : recordObj.isPosting
                    }, context, recsToProcess);
                }
                else
                    recsToProcess = [];

                this.validateFields(recordObj); // this will throw an error if fields are invalid

                if (!ondemand) {
                    if (this.hasCurrentUsageFormula(recordObj.deprMethod)) {
                        utilLog.debug('skipping precalc for this asset, asset usage depreciation and not on demand.');
                        return;
                    }
                    if (recordObj.isGrpDepr && recordObj.isGrpMaster) {
                        utilLog.debug('skipping precalc for this asset, group depreciation and not on demand.')
                        return;
                    }
                }

                // if available, set last forecast date as start for computation
                if (slaveFields.lastForecastDate) {
                    deprStartDate = formatter.parse({
                        value: slaveFields.lastForecastDate,
                        type: formatter.getType('DATE')
                    });
                }

                // set pre-calc max date if specified
                var preCalcMaxDateObj = scriptParams.date || null;
                if (preCalcMaxDateObj) {
                    deprEndDate = preCalcMaxDateObj;
                    // to date, making sure since scripts passes as string
                    if (!deprEndDate.getDate) {
                        deprEndDate = formatter.parse({
                            value: preCalcMaxDateObj,
                            type: formatter.getType('DATE')
                        });
                    }
                }

                if (isTax) {
                    groupInfo = this.getGroupInfo(utilSearch.parseCsvToInternalIdArray(subsidiaries));
                }

                // get depreciation result and store in recordObj for writing
                recordObj.periods = libDepreciation.depreciateRecord(recordObj, deprEndDate,
                    deprStartDate, constList.BatchSize.PreCalcPeriod, groupInfo);

                var deprError = null;
                if (recordObj.periods.error) {
                    deprError = recordObj.periods.error;
                    delete recordObj.periods.error;
                }

                recordObj.slaveId = slaveId;
                if (!deprError &&
                    recordObj.forecastStatus !== constList.ForecastStatus.Completed &&
                    Object.keys(recordObj.periods).length >= constList.BatchSize.PreCalcPeriod) {
                    context.write(RERUN_SLAVE_LIST_KEY, +slaveId);
                }

                // save periods and last forecast date, prepare hash list to write
                var historySaveRes = this.writeHistory(recordObj, isTax, isConsolidated, recsToProcess, context);

                // if history rec save was successful, write hash to context for reduce, use ' ' as value to save on memory
                if (recordObj.isPosting && historySaveRes.updatedSlaveId) {
                    for (var i = 0; i < historySaveRes.hashList.length; i++) {
                        var hash = historySaveRes.hashList[i];
                        context.write(hash, assetId);
                    }
                }

                if (deprError) { throw deprError; }
            }
        }
        catch(ex){
            if (!ondemand &&
                    (ex.name === 'NO_OPEN_FUTURE_ACCOUNTING_PERIOD' ||
                            ex.name === 'NO_ACCOUNTING_PERIOD')){
                return;
            }

            var records = [];
            if (slaveId) {
                records.push('customrecord_fam_assetvalues-' + slaveId);
            }
            if (parentRecordType && parentRecordId) {
                records.push(parentRecordType + '-' + parentRecordId);
            }

            throw error.create({
                name: 'MAP_ERROR',
                message: JSON.stringify({
                    records: records,
                    ex: ex
                }),
                assetIdList: assetId
            });
        }
    };

    /**
     * Create a summary record for the given hash string if it does not exist.
     *
     * @param {Object} context - key = hash string, value = asset id
     */
    module.reduce = function(context) {
       utilLog.debug('reduce parameters', 'key: ' + context.key + ' | value: ' +
            JSON.stringify(context.values));

        var hashValue = context.key;
        var hashObj = hashValue ? utilSummaryHash.parseHashValue(hashValue) : {};
        var assetId = 0;

        try{
            if (hashValue === SLAVE_ID_LIST_KEY || hashValue === RERUN_SLAVE_LIST_KEY ||
                hashValue === JOURNAL_ID_LIST_KEY) {

                context.write(hashValue, context.values);
            }
            else if (hashObj.bookId && !this.hasExistingSummaryRecord(hashValue)) {
                hashObj.hash = hashValue;
                assetId = context.values;
                var recId = this.createSummaryRecord(hashObj);
                utilLog.debug('write summary successful', 'summary id: ' + recId);
            }
        }catch(ex){
            var message = ex.message ? ex.message : JSON.stringify({ex : ex});

            throw error.create({
                name: 'REDUCE_ERROR',
                message: message,
                assetIdList: assetId
            });
        }
    };

     /**
     * Log results of script
     * Set process state and call process manager
     *
     * @param {Object} summary - stores result of M/R stages
     */
    module.summarize = function(summary) {
        var startTime = (new Date()).getTime(),
            errorObj = {},
            assetID = 0,
            errAssetIdList = [];

        var mapResults = {
            keys: [],
            errors: []
        };
        var reduceResults = {
            keys: [],
            errors: []
        };

        summary.mapSummary.keys.iterator().each(function (key) {
            mapResults.keys.push(key);
            return true;
        });
        summary.mapSummary.errors.iterator().each(function (key, error) {
            errorObj = JSON.parse(error);
            assetID = (errorObj.cause && errorObj.cause.assetIdList) ? errorObj.cause.assetIdList : 0;
            utilLog.error('map errorObj ' + error);

            if (assetID) errAssetIdList = errAssetIdList.concat(assetID);

            if (errorObj.name === 'MAP_ERROR') {
                var errorMsgObj = JSON.parse(errorObj.message);
                utilLog.error('map error on ' + errorMsgObj.recType + ': ' + errorMsgObj.recId, errorMsgObj.ex);
                mapResults.errors.push({
                    records: errorMsgObj.records,
                    error: utilError.formatForFPR(errorMsgObj.ex)
                });
            }
            else {
                utilLog.error('map error ' + key, error);
                mapResults.errors.push({
                    error: utilError.formatForFPR(errorObj)
                });
            }
            return true;
        });
        summary.reduceSummary.keys.iterator().each(function (key) {
            var blockIds = [SLAVE_ID_LIST_KEY, RERUN_SLAVE_LIST_KEY, JOURNAL_ID_LIST_KEY];
            if (blockIds.indexOf(key) === -1) {
                reduceResults.keys.push(key);
            }
            return true;
        });
        summary.reduceSummary.errors.iterator().each(function (key, error) {
            errorObj = JSON.parse(error);
            assetID = (errorObj.cause && errorObj.cause.assetIdList) ? errorObj.cause.assetIdList : 0;
            utilLog.error('reduce errorObj ' + error);

            if(assetID) errAssetIdList = errAssetIdList.concat(assetID);

            reduceResults.errors.push({
                error: utilError.formatForFPR(JSON.parse(error))
            });
            utilLog.error('reduce error on summary: ' + key, error);
            return true;
        });

        var slaveIdList = [], reRunList = [], journalList = [];
        summary.output.iterator().each(function (key, value){
            if (key === SLAVE_ID_LIST_KEY)
                slaveIdList = JSON.parse(value);
            else if (key === RERUN_SLAVE_LIST_KEY)
                reRunList = JSON.parse(value);
            else if (key === JOURNAL_ID_LIST_KEY)
                journalList = JSON.parse(value);
            return true;
        });

        utilLog.audit('getInputData - Elapsed Time (sec)', summary.inputSummary.seconds);
        utilLog.audit('map - Elapsed Time (sec)', summary.mapSummary.seconds);
        utilLog.audit('map - Instances', (mapResults.keys.length || 0));
        utilLog.audit('map - Errors', (mapResults.errors.length || 0));
        utilLog.audit('reduce - Elapsed Time (sec)', summary.reduceSummary.seconds);
        utilLog.audit('reduce - Instances', (reduceResults.keys.length || 0));
        utilLog.audit('reduce - Errors', (reduceResults.errors.length || 0));
        utilLog.audit('summarize - Elapsed Time (sec)', ((new Date()).getTime() - startTime) / 1000);

        var journalIds, lastSlaveId = 0,
            fprId = runtime.getCurrentScript().getParameter({ name: 'custscript_precalc_fprid' }) || null,
            stageEndOptions = { fprId : fprId },
            currentParams = this.getCurrentFPRParams(fprId);

        if (reRunList.length > 0) {
            lastSlaveId = Math.min.apply(null, reRunList) - 1;
        }
        else if (slaveIdList.length > 0) {
            lastSlaveId = Math.max.apply(null, slaveIdList);
        }

        stageEndOptions.params = {};
        if (lastSlaveId)
            stageEndOptions.params.lastSlaveId = lastSlaveId;
        if (journalList.length > 0) {
            journalIds = currentParams.journals || [];
            if (journalIds.length > 0)
                journalIds = journalIds.trim().split(',');

            journalIds = journalIds.concat(journalList);
            journalIds = utilArr.findUnique(journalIds);
            stageEndOptions.params.journals = journalIds.join();
        }

        if(fprId && errAssetIdList.length > 0){
            this.moveFailedAssets(fprId, stageEndOptions, errAssetIdList);
        }

        // set sub-process to completed
        stageEndOptions.errors = [].concat(mapResults.errors).concat(reduceResults.errors);
        stageEndOptions.mapResult = mapResults.keys.length - mapResults.errors.length;
        stageEndOptions.reduceResult = reduceResults.keys.length - reduceResults.errors.length;
        if (stageEndOptions.errors.length > 0) {
            stageEndOptions.status = constList.ProcStageStatus.CompletedWithErrors;
        }
        utilProcess.Stage.end(stageEndOptions); // set sub-process to completed

        var procId = utilProcess.Control.callProcessManager();
        utilLog.debug('Triggering Process Manager', 'Process ID: ' + procId);
    };

    module.getScriptParams = function(){
        var scriptobj  = runtime.getCurrentScript(),
        params = {
            lastSlaveId : +scriptobj.getParameter({ name: 'custscript_precalc_slaveid' }) || null,
            maxSlaveId : +scriptobj.getParameter({ name: 'custscript_precalc_maxslaveid' }) || null,
            assetTypes : scriptobj.getParameter({ name: 'custscript_precalc_assettype' }) || '',
            subs : scriptobj.getParameter({ name: 'custscript_precalc_subsidiary' }) || '',
            books : scriptobj.getParameter({ name: 'custscript_precalc_book' }) || '',
            date : scriptobj.getParameter({ name: 'custscript_precalc_maxdate' }) || undefined,
            fprId : scriptobj.getParameter({ name: 'custscript_precalc_fprid' }) || null,
            ondemand : scriptobj.getParameter({ name: 'custscript_precalc_is_ondemand' }) || false,
            recsToProcess : scriptobj.getParameter({ name: 'custscript_precalc_asset' }) || null
        };

        return params;
    };

    module.validateParams = function(params){
        var isValid = true;

        if (params.assetTypes && !utilSearch.isValidInternalIdFilter(params.assetTypes.trim())){
                isValid = false;
                utilLog.error('INVALID_FILTER', 'Invalid filter value: Asset Type');
        }
        if (params.subs && !utilSearch.isValidInternalIdFilter(params.subs.trim())){
                isValid = false;
                utilLog.error('INVALID_FILTER', 'Invalid filter value: Subsidiary');

        }
        if (params.books && !utilSearch.isValidInternalIdFilter(params.books.trim())){
            isValid = false;
            utilLog.error('INVALID_FILTER', 'Invalid filter value: Book');

        }
        return isValid;
    };

    module.buildSearchObj = function(filtersObj){
        var searchObj;
        if (filtersObj.recsToProcess){
            searchObj = utilPreCompute.createSearchForSpecificRecs(filtersObj);
        }
        else{
            var arrayParams = ['assetTypes', 'subs', 'books'];
            for (var i = 0; i < arrayParams.length; i++) {
                filtersObj[arrayParams[i]] = utilSearch.parseCsvToInternalIdArray(filtersObj[arrayParams[i]]);
            }
            if (filtersObj.date && isNaN(filtersObj.date)) {
                filtersObj.date = formatter.parse({
                    value : filtersObj.date,
                    type : formatter.getType('DATE')
                });
            }
            searchObj = utilPreCompute.createSearchForRecs(filtersObj);
        }

        // filter for batch
        searchObj.filterExpression = searchObj.filterExpression.concat(['and',
            ['formulanumeric: rownum', 'lessthan', constList.BatchSize.Precalc + 1]]);

        return searchObj;
    };

    /**
     * Lookup Slave record fields. This is called from map to save on memory usage on getInputData.
     *
     * @param id - asset slave id
     * @returns {Object} - object with asset slave field values
     */
    module.getSlaveFields = function(id) {
        var results = null;

        var lookupRes = search.lookupFields({
            type: 'customrecord_fam_assetvalues',
            id: id,
            columns: ['custrecord_slaveparentasset',
                      'custrecord_slaveparenttax',
                      'custrecord_slavelastforecastdate',
                      'custrecord_slavecurrentage',
                      'custrecord_slavepriornbv',
                      'custrecord_slavebookvalue',
                      'custrecord_slavelastdeprdate']
        });
        if (lookupRes) {
            results = {
                    asset: lookupRes.custrecord_slaveparentasset[0].value,
                    lastForecastDate: lookupRes.custrecord_slavelastforecastdate,
                    lastPeriod: lookupRes.custrecord_slavecurrentage,
                    priorNBV: lookupRes.custrecord_slavepriornbv,
                    currNBV: lookupRes.custrecord_slavebookvalue,
                    lastDate: lookupRes.custrecord_slavelastdeprdate
            };
            if (lookupRes.custrecord_slaveparenttax.length > 0){
                results.tax = lookupRes.custrecord_slaveparenttax[0].value;
            }
        }

        return results;
    };

    /**
     * Set Asset / Tax custom segment fields and its corresponding short-hand name
     */
    module.setCsegFields = function(){
        var csegFields = utilTFMap.getCsegFields();
        var parentAssetFld = 'custrecord_altdeprasset';
        assetDetails.cseg = {};
        taxDetails.cseg = {};
        for (var i in csegFields){
            var field = csegFields[i].assetField;
            assetDetails.cseg[field] = i;
            taxDetails.cseg[parentAssetFld+'.'+field] = i;
        };
        return csegFields;
    };

    /**
     * Get record fields to be used in depreciation pre-calc for asset/tax record
     *
     * @param {Integer} id
     * @returns {Object} - object with field values from lookupFields call
     */
    module.getFieldsForPrecalc = function(id, isTax){
        var type, columns, csegFields, results = null;

        if (isTax) {
            type = taxDetails.type;
            columns = taxDetails.columns;
            csegFields = taxDetails.cseg;
        }
        else {
            type = assetDetails.type,
            columns = assetDetails.columns;
            csegFields = assetDetails.cseg;

            //  if asset, add inactive fields before lookup
            for (var i in commonInactiveFields) {
                columns[i] = commonInactiveFields[i];
            }
        }
        // add custom segment fields
        for (var i in csegFields) {
            columns[i] = csegFields[i];
        }

        results = search.lookupFields({
            type: type,
            id: id,
            columns: Object.keys(columns)
        });
        if (results) {
            results.id = id;

            // if tax, lookup again for inactive fields
            if (isTax && results.custrecord_altdeprasset &&
                results.custrecord_altdeprasset.length > 0 && results.custrecord_altdeprasset[0].value) {
                var assetId = results.custrecord_altdeprasset[0].value;
                var addlResults = search.lookupFields({
                    type: assetDetails.type,
                    id: assetId,
                    columns: Object.keys(commonInactiveFields)
                });
                if (addlResults) {
                    for (var i in addlResults) {
                        results[i] = addlResults[i];
                    }
                }
            }
            // if asset, lookup again for currency
            else if (!isTax && runtime.isFeatureInEffect({ feature : 'MULTICURRENCY' }) &&
                results.custrecord_assetcurrency && results.custrecord_assetcurrency.length > 0 &&
                results.custrecord_assetcurrency[0].value) {

                var currencyId = results.custrecord_assetcurrency[0].value;
                var currInactive = search.lookupFields({
                    type: 'currency',
                    id: currencyId,
                    columns: 'isinactive'
                });
                results['custrecord_assetcurrency.isinactive'] = currInactive.isinactive; // TODO: cache asset currencies checked
            }
        }

        return results;
    };

    /**
     * Use the raw result from lookupFields and assign to an object
     * @param {Object} fields - result of lookupFields for asset/tax
     * @param {Object} slaveFields - result of lookupFields for slave
     * @param {Boolean} isTax : true - processing tax values
     *                          false - processing asset values
     * @returns {Object} - object with asset/tax field values
    */
    module.buildObjectForDepreciation = function(fields, slaveFields, isTax) {
        var recordObj = {};

        var blnMultiBook = runtime.isFeatureInEffect({feature :"MULTIBOOK"}),
            fieldMap = {},
            commonFieldMap, csegFields;

        if (isTax){
            commonFieldMap = taxDetails.columns;
            csegFields = taxDetails.cseg;
        }
        else{
            commonFieldMap = assetDetails.columns;
            csegFields = assetDetails.cseg;
        }

        // need to copy properties to object to avoid overwriting assetDetails/taxDetails
        for (var i in commonFieldMap) {
            fieldMap[i] = commonFieldMap[i];
        }

        // add inactive fields for asset and tax
        for (var i in commonInactiveFields) {
            fieldMap[i] = commonInactiveFields[i];
        }

        // add custom segment fields for asset/tax
        for (var i in csegFields) {
            fieldMap[i] = csegFields[i];
        }

        // add currency inactive field if asset
        if (!isTax) {
            fieldMap['custrecord_assetcurrency.isinactive'] = 'currInactive';
        }
        if (fields){
            recordObj = this.processSearchedValues(fields, fieldMap, slaveFields);

            if (isTax){
                recordObj.taxId = fields.id;

                if (recordObj.isGrpDepr && recordObj.isGrpMaster) {
                    recordObj.origCost = 0; // for PB defaulting; should not default to OC!
                }
            }
            else{
                recordObj.assetId = fields.id;
                recordObj.bookId = blnMultiBook ? utilAccounting.getPrimaryBookId() : 1;
                recordObj.isPosting = true;
            }

            if (+utilSetup.getSetting('isSummarizeJe') === constList.SummarizeBy['Parent']) {
                recordObj.parentId = '';
                var parentId = this.findAncestorAsset(recordObj.assetId); // assetId is also set to tax
                if (parentId !== recordObj.assetId || this.hasChildrenAsset(recordObj.assetId)) {
                    recordObj.parentId = parentId;
                }
            }
        }
        return recordObj;
    };

    module.processSearchedValues = function(searchedValues, fieldMap, slaveFields){
        var recordObj = {};
        for (var fieldId in searchedValues) {
            var fld = fieldMap[fieldId];
            if (!fld){continue;}
            if (searchedValues[fieldId] instanceof Array){
                recordObj[fld] = slaveFields && slaveFields[fld] != undefined ?
                        slaveFields[fld] :
                            searchedValues[fieldId].length > 0 ? searchedValues[fieldId][0].value : '';
            }
            else{
                recordObj[fld] = slaveFields && slaveFields[fld] != undefined ?
                        slaveFields[fld] : searchedValues[fieldId];
            }
        }
        return recordObj;
    };

    module.hasCurrentUsageFormula = function(deprMethodID){
        var hasCurrentUsageFormula = false;
        var lookupRes = search.lookupFields({
                type: 'customrecord_ncfar_deprmethod',
                id: deprMethodID,
                columns: ['custrecord_deprmethodformula']
            });
        if (lookupRes) {
            var formula = lookupRes.custrecord_deprmethodformula || '';
            hasCurrentUsageFormula = (formula.toUpperCase().indexOf('CU') !== -1);
        }
        return hasCurrentUsageFormula;
    };

    module.getHashFilter = function(options, isTax){
        var hashFilter = '',
            csegFields = isTax ? taxDetails.cseg : assetDetails.cseg;

        var csegVals = [];
        if (csegFields){
            for (var i in csegFields){
                var optionsKey = csegFields[i];
                var index = optionsKey.replace(CSEG_PREFIX,'');
                csegVals[index] = options[optionsKey] || '';
            }
        }

        hashFilter = utilSummaryHash.buildHashFilter({
            subId: options.subsidiary,
            currId: options.currId || '',
            bookId: options.isPosting ? options.bookId : '',
            depId: options.depId || '',
            classId: options.classId || '',
            projectId: options.projectId || '',
            locId: options.locId || '',
            assetType: options.assetType,
            parentId: options.parentId || '',
            repMainCat: options.repMainCat || '',
            repSubA: options.repSubA || '',
            depAcct: options.depAcct,
            chargeAcct: options.chargeAcct
        }, csegVals);

        return hashFilter;
    };

    module.getDHRCommonValues = function(options, isTax){
        return {
                custrecord_deprhistasset: options.assetId,
                custrecord_deprhisttype: constList.TransactionType.Depreciation,
                custrecord_deprhistassettype: options.assetType,
                custrecord_deprhistsubsidiary: options.subsidiary || '',
                custrecord_deprhistaccountingbook: options.bookId || null,
                custrecord_deprhistquantity: options.quantity,
                custrecord_deprhistaltdepr : options.taxId || null,
                custrecord_deprhistaltmethod : options.altMethod || null,
                custrecord_deprhistdeprmethod : isTax ? options.deprMethod : null
        };
    };

    /**
     * Writes the DHR record and prepares the hash strings to be used for summary.
     *
     * @param {Object} options - values to set to DHR and to form hash string
     * @returns {Object} - updatedSlaveId if saved with hashList array of hash strings
     */
    module.writeHistory = function(options, isTax, isConsolidated, recsToProcess, context) {
        var id = null, hashList = [], lastForecastDate = null;
        var rec = record.load({
            type: 'customrecord_fam_assetvalues',
            id: options.slaveId,
            isDynamic: true
        });

        options.bookId = options.bookId || utilAccounting.getPrimaryBookId();
        var hashFilter = this.getHashFilter(options, isTax);
        var fields = this.getDHRCommonValues(options, isTax);
        var periods = options.periods;
        var sublist = 'recmachcustrecord_deprhistassetslave';
        for (var date in periods) {
            var dateObj = formatter.parse({
                value: date,
                type: formatter.getType('DATE')
            });
            var hash = this.buildHashValue({
                hashFilter: hashFilter,
                postDate: dateObj
            }, isConsolidated, recsToProcess, context);

            rec.selectNewLine({
                sublistId: sublist
            });
            rec.setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'custrecord_deprhistdate',
                value: dateObj
            });
            rec.setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'custrecord_deprhistamount',
                value: periods[date].amount
            });
            rec.setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'custrecord_deprhistbookvalue',
                value: periods[date].nbv
            });
            rec.setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'custrecord_deprhistpriornbv',
                value: periods[date].pnbv
            });
            rec.setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'custrecord_deprhistcurrentage',
                value: periods[date].lastPeriod
            });
            rec.setCurrentSublistValue({
                sublistId: sublist,
                fieldId: 'name',
                value: hash
            });
            for (var fld in fields) {
                rec.setCurrentSublistValue({
                    sublistId: sublist,
                    fieldId: fld,
                    value: fields[fld]
                });
            };
            rec.commitLine({
                sublistId: sublist
            });

            // Do not add hash of zero-value DHR to prevent it from being written to summary
            if (periods[date].amount !== 0) {
                hashList.push(hash);
            }
            else {
                utilLog.debug('zero value DHR', hash + ' is omitted to prevent creation of summary.')
            }
            lastForecastDate = dateObj;
        }

        if (lastForecastDate) {
            rec.setValue('custrecord_slavelastforecastdate', lastForecastDate);
        }
        if (options.forecastStatus) {
            rec.setValue('custrecord_slaveforecaststatus', options.forecastStatus);
        }

        id = rec.save();
        utilLog.debug('write history successful', 'slave id: ' + id +
                ', last forecast date: ' + lastForecastDate +
                ', hash list: ' + JSON.stringify(hashList));

        return {
            updatedSlaveId: id,
            hashList: hashList
        };
    };

    /**
     * Checks for existence of a summary record with name = hash value
     *
     * @param hashValue
     * @returns {Boolean} true if the summary record for the given hash value exists, otherwise false
     */
    module.hasExistingSummaryRecord = function(hashValue) {
        var searchRes = null;

        var searchObj = search.create({
            type: 'customrecord_bg_summaryrecord',
            filters: [
                      search.createFilter({ name: 'name', operator: 'is', values: hashValue }),
                      search.createFilter({ name: 'custrecord_summary_histjournal', operator: 'anyof', values: '@NONE@' }),
                      search.createFilter({ name: 'isinactive', operator: 'is', values: false }),
                      ]
        });
        searchRes = searchObj.run().getRange(0, 1);  // only 1 record to count

        return (searchRes && searchRes.length > 0);
    };

    /**
     * Creates a BG - Summary Record
     *
     * @param {Object} obj - values to set to summary record
     * @returns {Integer} summary id if record is saved, otherwise null
     */
    module.createSummaryRecord = function(obj) {
        var summaryId = null;

        if (obj) {
            // use summary record for now, change if with perf problems
            var rec = record.create({type: 'customrecord_bg_summaryrecord'});
            rec.setValue('custrecord_summary_assettype', obj.assetType);
            rec.setValue('custrecord_summary_deprdate', obj.periodDate);
            rec.setValue('custrecord_summary_depracc', obj.depAcct);
            rec.setValue('custrecord_summary_chargeacc', obj.chargeAcct);
            rec.setValue('custrecord_summary_accountingbook', obj.bookId);
            rec.setValue('custrecord_summary_subsidiary', obj.subId);
            rec.setValue('custrecord_summary_department', obj.depId);
            rec.setValue('custrecord_summary_class', obj.classId);
            rec.setValue('custrecord_summary_location', obj.locId);
            rec.setValue('custrecord_summary_project', obj.projectId);
            rec.setValue('custrecord_summary_value', obj.sum);
            rec.setValue('name', obj.hash);

            summaryId = rec.save();
            utilLog.debug('created summary id', summaryId);
        }

        return summaryId;
    };

    module.findAncestorAsset = function (assetId) {
        var ret = '';

        if (assetId) {
            var assetInfo = search.lookupFields({
                type: 'customrecord_ncfar_asset',
                id: assetId,
                columns: ['custrecord_assetparent']
            });

            if (assetInfo.custrecord_assetparent && assetInfo.custrecord_assetparent.length > 0) {
                ret = this.findAncestorAsset(assetInfo.custrecord_assetparent[0].value);
            }
            else {
                ret = assetId;
            }
        }

        return ret;
    };

    module.hasChildrenAsset = function(assetId) {
        var ret = false;

        if (assetId) {
            var searchObj = search.create({
                type: 'customrecord_ncfar_asset',
                filters: [
                    search.createFilter({ name: 'custrecord_assetparent', operator: 'anyof', values: assetId }),
                    search.createFilter({ name: 'isinactive', operator: 'is', values: false }),
                ]
            });

            searchRes = searchObj.run().getRange(0, 1);  // if at least 1
            if(searchRes && searchRes.length > 0){
                ret = true;
            }
        }

        return ret;
    };

    module.getGroupInfo = function(subsidiaries, forceRefreshCache) {
        forceRefreshCache = forceRefreshCache || false;

        var groupInfoCache = cache.get({name: GROUPINFO_CACHE});
        var groupInfo = groupInfoCache.get({key: 'masterData'});

        if (groupInfo && !forceRefreshCache) {
            groupInfo = JSON.parse(groupInfo);
        }
        else {
            groupInfo = libDepreciation.getGroupInfo(subsidiaries);
            groupInfoCache.put({
                key: 'masterData',
                value: JSON.stringify(groupInfo),
                ttl: 300 // 5 minutes
            });

            utilLog.debug('groupInfo', JSON.stringify(groupInfo));
        }

        return groupInfo;
    };

    module.validateFields = function(recordObj) {
        var errors = [],
            missingFields = utilSummaryHash.getMissingFields(recordObj, true),
            inactiveFields = utilSummaryHash.getInactiveFields(recordObj, true);

        if (missingFields) {
            errors.push(missingFields);
        }

        if (inactiveFields) {
            errors.push(inactiveFields);
        }

        if (errors.length > 0) {
            throw {
                name: 'INVALID_PRECALC_FIELD_VALUE',
                message: errors.join('<br>')
            };
        }
    };

    module.processDateFilters = function(params){
        var lastDate = formatter.parse({ value: params.lastDate, type:  formatter.getType('DATE')});
        lastDate = new Date(lastDate.getFullYear(),
                lastDate.getMonth(),
                lastDate.getDate() + 1);

        var date = formatter.parse({ value: params.date, type:  formatter.getType('DATE')});
        date = new Date(date.getFullYear(),
                date.getMonth(),
                date.getDate() - 1);

        return {
            startDate : formatter.format({ value: lastDate, type: formatter.getType('DATE') }),
            endDate : formatter.format({ value: date, type: formatter.getType('DATE') })
        }
    };

    module.searchDHRsForEdit = function(params){
        var dateParams = this.processDateFilters(params);
        var filters = [
                search.createFilter({name: 'isinactive', operator: search.getOperator('IS'), values: 'F'}),
                search.createFilter({name: 'custrecord_deprhisttype', operator: search.getOperator('ANYOF'), values: [constList.TransactionType.Depreciation]}),
                search.createFilter({name: 'custrecord_deprhistassetslave', operator: search.getOperator('ANYOF'), values: [params.slaveId]}),
                search.createFilter({name: 'custrecord_deprhistdate', operator: search.getOperator('WITHIN'), values: [dateParams.startDate, dateParams.endDate]})
            ];
        var columns = [
                search.createColumn({name : 'name'}),
                search.createColumn({name : 'custrecord_deprhistdate', sort : search.getSort('ASC')})];

        var searchObj = search.create({
            type : 'customrecord_ncfar_deprhistory',
            filters : filters,
            columns : columns
        });
        var pagedData = searchObj.runPaged({ pageSize : 1000 });

        return pagedData;
    };

    module.editDHRname = function(params, context, recsToProcess) {
        var postDate;
        var pagedData = this.searchDHRsForEdit(params);

        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index : pageRange.index });
            page.data.forEach(function(searchRes) {
                var name = searchRes.getValue('name');
                var datePart = name.substring(0, name.indexOf('|'));
                var hashFilter = name.substring(name.indexOf('|')+1, name.lastIndexOf('|'));

                postDate = new Date (datePart.substring(0,4), datePart.substring(4,6)-1, datePart.substring(6));

                if (params.isPosting) {
                    var journalId = module.getSummaryJournal(name);
                    if (journalId) {
                        context.write(JOURNAL_ID_LIST_KEY, journalId);
                    }
                    else {
                        var newHash = module.buildHashValue({
                            hashFilter : hashFilter,
                            postDate : postDate
                        }, false, recsToProcess, context);

                        record.submitFields({
                            type : 'customrecord_ncfar_deprhistory',
                            id : searchRes.id,
                            values : { name : newHash }
                        });

                        context.write(newHash, params.assetId);
                    }
                }
            });
        });
    };

    module.buildHashValue = function (options, isConsolidated, assetIds, context) {
        var i, newHash, summariesToCreate = [];

        newHash = utilSummaryHash.buildHashValue(options, isConsolidated, assetIds, summariesToCreate);

        for (i = 0; i < summariesToCreate.length; i++) {
            context.write(summariesToCreate[i][0], summariesToCreate[i][1]);
        }

        return newHash;
    };

    module.getCurrentFPRParams = function (fprId) {
        var rec, params;

        rec = record.load({
            type : 'customrecord_fam_process',
            id : fprId
        });

        params = rec.getValue({ fieldId: 'custrecord_fam_procparams' }) || '{}';
        params = JSON.parse(params);

        return params;
    };

    module.getSummaryJournal = function (hashName) {
        var retVal,
            sumJrnCache = cache.get({ name : 'summaryJournalCache' });

        retVal = sumJrnCache.get({
            key : hashName,
            ttl : 60 * 5, // minutes
            loader : function () {
                var ret = '', searchObj, searchRes;

                searchObj = search.create({
                    type: 'customrecord_bg_summaryrecord',
                    filters: [
                        ['name', search.getOperator('IS'), hashName], 'and',
                        ['isinactive', search.getOperator('IS'), false]
                    ],
                    columns : ['custrecord_summary_histjournal']
                });
                searchRes = searchObj.run().getRange(0, 1);

                if (searchRes && searchRes.length > 0)
                    ret = searchRes[0].getValue({ name : 'custrecord_summary_histjournal' });

                return ret;
            }
        });

        return retVal;
    };

    module.moveFailedAssets = function(fprId, stageEndOptions, errAssetIdList){
        stageEndOptions.params = stageEndOptions.params ? stageEndOptions.params : {};

        var rec = record.load({
                    type: 'customrecord_fam_process',
                    id: fprId
                }),
        params = rec.getValue({ fieldId: 'custrecord_fam_procparams' }) || '{}',
        paramsObj = JSON.parse(params);

        var uniqueAssetsList = utilArr.findUnique(errAssetIdList);

        if(paramsObj.recsToProcess){
            var recsList = utilFprParams.moveAssetsToRecsFailed({
                recsToProcess : paramsObj.recsToProcess,
                recsFailed : paramsObj.recsFailed
            },
            uniqueAssetsList);

            stageEndOptions.params.recsToProcess = recsList.recsToProcess;
            stageEndOptions.params.recsFailed = recsList.recsFailed;
        }
    };

    return module;
}
